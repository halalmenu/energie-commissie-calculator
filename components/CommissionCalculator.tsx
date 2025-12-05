'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Supplier, AgentRole, CommissionRule, CalculationResult, TieredRate } from '@/types';
import { Calculator, Zap, Flame, Euro, Info, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import RateCard from './RateCard';

export default function CommissionCalculator() {
  const [standardRoleId, setStandardRoleId] = useState<string>('');
  const [contractDuration, setContractDuration] = useState<number>(3);
  const [kwhInput, setKwhInput] = useState<string>('3500');
  const [m3Input, setM3Input] = useState<string>('1200');
  const [elecEanCount, setElecEanCount] = useState<string>('1');
  const [gasEanCount, setGasEanCount] = useState<string>('1');
  
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStandardRole();
  }, []);

  const fetchStandardRole = async () => {
    const { data, error } = await supabase
      .from('energy_agent_roles')
      .select('*')
      .eq('name', 'Standard')
      .single();
    
    if (data) {
      setStandardRoleId(data.id);
    }
  };

  const calculateCommissions = async () => {
    if (!standardRoleId) return;
    
    setLoading(true);
    try {
      const { data: rules, error } = await supabase
        .from('energy_commission_rules')
        .select(`
          *,
          supplier:energy_suppliers(*),
          tiers:energy_tiered_rates(*)
        `)
        .eq('role_id', standardRoleId);

      if (error || !rules) {
        console.error('Error fetching rules:', error);
        setLoading(false);
        return;
      }

      const kwhInputValue = Number(kwhInput) || 0;
      const m3InputValue = Number(m3Input) || 0;
      const elecEanValue = Number(elecEanCount) || 0;
      const gasEanValue = Number(gasEanCount) || 0;

      // Verbruiksvergoedingen moeten op 3 jaar basis berekend worden
      // Bij 3 jaar: verbruik * 3, bij 1 jaar: verbruik zoals het is (wordt later gedeeld door 3)
      const kwhValue = contractDuration === 3 ? kwhInputValue * 3 : kwhInputValue;
      const m3Value = contractDuration === 3 ? m3InputValue * 3 : m3InputValue;

      const calculated = rules.map((rule: CommissionRule) => {
        let electricityComm = 0;
        let gasComm = 0;
        let baseFee = 0;
        let details = '';

        // 1. Electricity Calculation
        if (rule.has_tiered_pricing && rule.tiers) {
          const elecTier = rule.tiers.find(t => 
            t.product_type === 'electricity' && 
            kwhValue >= t.min_volume && 
            (t.max_volume === null || kwhValue < t.max_volume)
          );
          if (elecTier) {
            electricityComm = Number(elecTier.fixed_fee);
            details += `Tier Elec: €${elecTier.fixed_fee} (Range: ${elecTier.min_volume}-${elecTier.max_volume || '+'}); `;
          }
        } else {
          electricityComm = (kwhValue * (rule.rate_per_kwh || 0));
        }

        // 2. Gas Calculation
        if (rule.has_tiered_pricing && rule.tiers) {
           const gasTier = rule.tiers.find(t => 
            t.product_type === 'gas' && 
            m3Value >= t.min_volume && 
            (t.max_volume === null || m3Value < t.max_volume)
          );
          if (gasTier) {
            gasComm = Number(gasTier.fixed_fee);
            details += `Tier Gas: €${gasTier.fixed_fee} (Range: ${gasTier.min_volume}-${gasTier.max_volume || '+'}); `;
          }
        } else {
          gasComm = (m3Value * (rule.rate_per_m3 || 0));
        }

        // 3. Base Fees (vaste vergoedingen blijven zoals ze zijn)
        if (!rule.has_tiered_pricing) {
           const eanRate = Number(rule.rate_per_ean || 0);
           baseFee = (elecEanValue + gasEanValue) * eanRate;
        }

        let total = electricityComm + gasComm + baseFee;

        // 4. Modifiers
        if (rule.percentage_modifier && rule.percentage_modifier !== 100) {
          const original = total;
          total = total * (rule.percentage_modifier / 100);
          details += `Applied ${rule.percentage_modifier}% modifier (Original: €${original.toFixed(2)}); `;
        }

        // 5. Contract Duration Adjustment (alleen voor 1 jaar contracten)
        if (contractDuration === 1) {
            const originalTotal = total;
            electricityComm = electricityComm / 3;
            gasComm = gasComm / 3;
            baseFee = baseFee / 3;
            total = total / 3;
            details += `1 Jaar contract (1/3 van 3 jaar: €${originalTotal.toFixed(2)}); `;
        }

        return {
          supplierName: rule.supplier?.name || 'Unknown',
          totalCommission: total,
          breakdown: {
            electricity: electricityComm,
            gas: gasComm,
            baseFee: baseFee
          },
          details: details
        };
      });

      setResults(calculated.sort((a, b) => b.totalCommission - a.totalCommission));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Instellingen
              </CardTitle>
              <CardDescription>
                Vul de gegevens in om commissies te berekenen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contract Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Looptijd
                </Label>
                <Select 
                  value={contractDuration.toString()} 
                  onValueChange={(val) => setContractDuration(Number(val))}
                >
                  <SelectTrigger id="duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Jaar</SelectItem>
                    <SelectItem value="1">1 Jaar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Consumption Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kwh" className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Stroom Verbruik (kWh/jaar)
                  </Label>
                  <Input
                    id="kwh"
                    type="number"
                    value={kwhInput}
                    onChange={(e) => setKwhInput(e.target.value)}
                    placeholder="3500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="m3" className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Gas Verbruik (m³/jaar)
                  </Label>
                  <Input
                    id="m3"
                    type="number"
                    value={m3Input}
                    onChange={(e) => setM3Input(e.target.value)}
                    placeholder="1200"
                  />
                </div>
              </div>

              <Separator />

              {/* EAN Counts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="elec-ean">Stroom EANs</Label>
                  <Input
                    id="elec-ean"
                    type="number"
                    value={elecEanCount}
                    onChange={(e) => setElecEanCount(e.target.value)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gas-ean">Gas EANs</Label>
                  <Input
                    id="gas-ean"
                    type="number"
                    value={gasEanCount}
                    onChange={(e) => setGasEanCount(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <Button 
                onClick={calculateCommissions}
                disabled={loading || !standardRoleId}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>Berekenen...</>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Bereken Commissies
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-4">
          {results.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resultaten
                </h2>
                <Badge variant="secondary">
                  {contractDuration} Jaar Contract
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {results.map((res, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{res.supplierName}</h3>
                            {idx === 0 && (
                              <Badge variant="default" className="bg-green-600">
                                Beste
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Stroom</p>
                              <p className="text-lg font-semibold">€{res.breakdown.electricity.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Gas</p>
                              <p className="text-lg font-semibold">€{res.breakdown.gas.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Vaste Vergoeding</p>
                              <p className="text-lg font-semibold">€{res.breakdown.baseFee.toFixed(2)}</p>
                            </div>
                          </div>

                          {res.details && (
                            <div className="flex items-start gap-2 pt-2 border-t">
                              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                              <p className="text-xs text-muted-foreground">{res.details}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right border-l pl-6">
                          <p className="text-sm text-muted-foreground mb-1">Totaal Commissie</p>
                          <p className="text-3xl font-bold text-green-600">
                            €{res.totalCommission.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nog geen berekening</h3>
                <p className="text-muted-foreground">
                  Vul de instellingen in en klik op "Bereken Commissies" om te beginnen
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rate Card */}
      <div className="mt-8">
        <RateCard />
      </div>
    </div>
  );
}
