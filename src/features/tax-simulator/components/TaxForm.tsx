'use client';

import { useState } from 'react';
import TaxResult from './TaxResult';

/** 세금 계산 결과 타입 */
export interface TaxCalcResult {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  holdingDays: number;
  isMajorHolder: boolean;
  capitalGain: number;
  taxRate: number;
  estimatedTax: number;
  afterTaxProfit: number;
}

/** 세금 시뮬레이터 입력 폼 */
export default function TaxForm() {
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [holdingDays, setHoldingDays] = useState(0);
  const [isMajorHolder, setIsMajorHolder] = useState(false);
  const [result, setResult] = useState<TaxCalcResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const capitalGain = (sellPrice - buyPrice) * quantity;
    // 세율: 일반 22%, 대주주 27.5%
    const taxRate = isMajorHolder ? 27.5 : 22;
    const estimatedTax = capitalGain > 0 ? Math.floor(capitalGain * (taxRate / 100)) : 0;
    const afterTaxProfit = capitalGain - estimatedTax;

    setResult({
      buyPrice,
      sellPrice,
      quantity,
      holdingDays,
      isMajorHolder,
      capitalGain,
      taxRate,
      estimatedTax,
      afterTaxProfit,
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* 매수가 */}
          <div>
            <label htmlFor="buyPrice" className="mb-1 block text-sm font-medium text-gray-700">
              매수가 (원)
            </label>
            <input
              id="buyPrice"
              type="number"
              min={0}
              value={buyPrice || ''}
              onChange={(e) => setBuyPrice(Number(e.target.value))}
              placeholder="예: 70000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 매도가 */}
          <div>
            <label htmlFor="sellPrice" className="mb-1 block text-sm font-medium text-gray-700">
              매도가 (원)
            </label>
            <input
              id="sellPrice"
              type="number"
              min={0}
              value={sellPrice || ''}
              onChange={(e) => setSellPrice(Number(e.target.value))}
              placeholder="예: 85000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 수량 */}
          <div>
            <label htmlFor="quantity" className="mb-1 block text-sm font-medium text-gray-700">
              수량 (주)
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity || ''}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="예: 100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* 보유기간 */}
          <div>
            <label htmlFor="holdingDays" className="mb-1 block text-sm font-medium text-gray-700">
              보유기간 (일)
            </label>
            <input
              id="holdingDays"
              type="number"
              min={0}
              value={holdingDays || ''}
              onChange={(e) => setHoldingDays(Number(e.target.value))}
              placeholder="예: 365"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* 대주주 여부 */}
        <div className="mt-4 flex items-center gap-2">
          <input
            id="isMajorHolder"
            type="checkbox"
            checked={isMajorHolder}
            onChange={(e) => setIsMajorHolder(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isMajorHolder" className="text-sm text-gray-700">
            대주주 해당 (지분 1% 이상 또는 종목당 10억 원 이상)
          </label>
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          세금 계산하기
        </button>
      </form>

      {/* 결과 표시 */}
      {result && <TaxResult result={result} />}
    </div>
  );
}
