'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { CommissionRule } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RateCard() {
  const [rules, setRules] = useState<CommissionRule[]>([]);

  useEffect(() => {
    const fetchRules = async () => {
      // Haal alleen Standard regels op
      const { data: standardRole } = await supabase
        .from('energy_agent_roles')
        .select('id')
        .eq('name', 'Standard')
        .single();

      if (!standardRole) return;

      const { data } = await supabase
        .from('energy_commission_rules')
        .select(`
          *,
          supplier:energy_suppliers(name),
          tiers:energy_tiered_rates(*)
        `)
        .eq('role_id', standardRole.id)
        .order('supplier_id');
      
      if (data) setRules(data);
    };
    fetchRules();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Huidige Tarieven Overzicht</CardTitle>
        <CardDescription>
          Basis tarieven voor 3-jarige contracten. Voor 1-jarige contracten wordt het bedrag gedeeld door 3.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leverancier</TableHead>
                <TableHead>Per kWh</TableHead>
                <TableHead>Per m³</TableHead>
                <TableHead>Vaste Vergoeding</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.supplier?.name}
                  </TableCell>
                  <TableCell>
                    {rule.has_tiered_pricing ? (
                      <Badge variant="secondary">Tiered</Badge>
                    ) : (
                      `€${rule.rate_per_kwh}`
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.has_tiered_pricing ? (
                      <Badge variant="secondary">Tiered</Badge>
                    ) : (
                      `€${rule.rate_per_m3}`
                    )}
                  </TableCell>
                  <TableCell>
                    {rule.has_tiered_pricing ? (
                      <Badge variant="secondary">Tiered</Badge>
                    ) : (
                      `€${rule.rate_per_ean}`
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {rule.has_tiered_pricing && rule.tiers && (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {rule.tiers.map(t => (
                            <div key={t.id}>
                              {t.product_type}: {t.min_volume}-{t.max_volume || '+'} = €{t.fixed_fee}
                            </div>
                          ))}
                        </div>
                      )}
                      {rule.percentage_modifier && rule.percentage_modifier !== 100 && (
                        <Badge variant="outline" className="mt-1">
                          {rule.percentage_modifier}% Modifier
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
