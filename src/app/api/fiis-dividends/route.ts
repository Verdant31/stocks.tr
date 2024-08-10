'use server'
import { prisma } from '@/lib/prisma'
import { Dividend } from '@/types/fiis'
import { dateToEnFormat } from '@/utils/date-to-en-format'
import { FiisOperations } from '@prisma/client'
import _ from 'lodash'
import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET() {
  try {
    const fiisOperations = await prisma.fiisOperations.findMany({})
    const fiisAsKeys = _.groupBy(fiisOperations, 'fiiName')

    const fiis = Object.keys(fiisAsKeys).map((fiiName) => ({
      fiiName: fiiName + '.SA',
      operations: fiisAsKeys[fiiName].map((operation) => ({
        ...operation,
        date: dateToEnFormat(operation.date),
      })),
    }))

    const calculateMonthlyDividends = (
      fiiOperations: FiisOperations[],
      dividends: Dividend[],
    ) => {
      const monthlyDividends: Record<string, number> = {}

      for (const dividend of dividends) {
        let quotesOwnedAtPayment = 0

        for (const operation of fiiOperations) {
          const purchaseWasBeforeOrSameDayAsPayment =
            new Date(operation.date) <= dividend.date

          if (purchaseWasBeforeOrSameDayAsPayment) {
            if (operation.type === 'purchase') {
              quotesOwnedAtPayment += operation.qty
            } else if (operation.type === 'sale') {
              quotesOwnedAtPayment -= operation.qty
            }
          }
        }
        if (quotesOwnedAtPayment < 0) quotesOwnedAtPayment = 0

        const dividendsReceived = quotesOwnedAtPayment * dividend.dividends

        const monthKey = `${dividend.date.getFullYear()}-${String(dividend.date.getMonth() + 1).padStart(2, '0')}`

        if (!monthlyDividends[monthKey]) {
          monthlyDividends[monthKey] = 0
        }
        monthlyDividends[monthKey] += dividendsReceived
      }

      return monthlyDividends
    }

    const promises = fiis.map(async (fii) => {
      const dividends = await yahooFinance.historical(fii.fiiName, {
        period1: '2023-01-01',
        period2: new Date(),
        events: 'dividends',
      })

      return {
        fiiName: fii.fiiName,
        monthlyDividends: calculateMonthlyDividends(fii.operations, dividends),
      }
    })

    const results = await Promise.all(promises)

    return NextResponse.json({
      results: results ?? [],
      status: 200,
    })
  } catch (err) {
    return NextResponse.json({ message: (err as Error)?.message, status: 500 })
  }
}