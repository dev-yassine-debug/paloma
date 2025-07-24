
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CommissionCalculator = () => {
  const [basePrice, setBasePrice] = useState<number>(100);
  const [rates, setRates] = useState({
    commission: 5.0,
    cashback: 1.5
  });
  const [calculation, setCalculation] = useState({
    commission: 0,
    finalPrice: 0,
    cashback: 0,
    adminGain: 0
  });

  useEffect(() => {
    loadCommissionRates();
  }, []);

  useEffect(() => {
    calculateAmounts();
  }, [basePrice, rates]);

  const loadCommissionRates = async () => {
    try {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('customer_commission_percent, cashback_percent')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      setRates({
        commission: data.customer_commission_percent,
        cashback: data.cashback_percent
      });
    } catch (error) {
      console.error('Erreur chargement taux:', error);
      toast.error("Erreur lors du chargement des taux de commission");
    }
  };

  const calculateAmounts = () => {
    const commission = Math.round(basePrice * (rates.commission / 100) * 100) / 100;
    const finalPrice = basePrice + commission;
    const cashback = Math.round(finalPrice * (rates.cashback / 100) * 100) / 100;
    const adminGain = commission - cashback;

    setCalculation({
      commission,
      finalPrice,
      cashback,
      adminGain
    });
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} SAR`;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculateur de Commission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="basePrice">Prix de base (SAR)</Label>
          <Input
            id="basePrice"
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span>Prix de base:</span>
            <span className="font-semibold">{formatCurrency(basePrice)}</span>
          </div>
          <div className="flex justify-between text-orange-600">
            <span>Commission ({rates.commission}%):</span>
            <span className="font-semibold">+{formatCurrency(calculation.commission)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Prix final client:</span>
            <span>{formatCurrency(calculation.finalPrice)}</span>
          </div>
          <div className="flex justify-between text-blue-600">
            <span>Cashback client ({rates.cashback}%):</span>
            <span className="font-semibold">-{formatCurrency(calculation.cashback)}</span>
          </div>
          <div className="flex justify-between text-green-600 font-bold border-t pt-2">
            <span>Gain admin net:</span>
            <span>{formatCurrency(calculation.adminGain)}</span>
          </div>
        </div>

        <Button 
          onClick={loadCommissionRates} 
          variant="outline" 
          className="w-full"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Actualiser les taux
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommissionCalculator;
