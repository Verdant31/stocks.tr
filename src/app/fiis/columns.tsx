'use client'

import { DataTableColumnHeader } from '@/components/table'
import { Dividend } from '@/queries/use-fiis-dividends'
import { FiiSummary } from '@/types/fiis'
import { currencyFormatter } from '@/utils/currency-formatter'
import { FiisOperations } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

export const fiisSummaryColumns: ColumnDef<FiiSummary>[] = [
  {
    accessorKey: 'fiiName',
    header: 'Nome',
    cell: ({ row }) => {
      return <div className=" font-medium">{row.getValue('fiiName')}</div>
    },
  },
  {
    accessorKey: 'quotes',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Cotas" />
    },
    cell: ({ row }) => {
      return <div className=" font-medium">{row.getValue('quotes')}</div>
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Preço" />
    },
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      const changedValue =
        100 - (row.original.valueAtFirstPurchase * 100) / price

      return (
        <div className=" font-medium">
          {currencyFormatter(row.getValue('price'))}
          {changedValue > 0 ? (
            <span className="font-semibold text-green-500">
              {' '}
              ({changedValue.toFixed(1)}%)
            </span>
          ) : (
            <span className="font-semibold text-[#ed2846]">
              {' '}
              ({changedValue.toFixed(1)}%)
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'variation',
    header: 'Variação',
    cell: ({ row }) => {
      if (!row.original.high || !row.original.low) {
        return <p className="font-medium">N/A</p>
      }

      return (
        <div className="font-medium flex flex-col md:block">
          {currencyFormatter(row.original.high - row.original.low)}
        </div>
      )
    },
  },
]

export const operationsSummaryColumns: ColumnDef<FiisOperations>[] = [
  {
    accessorKey: 'fiiName',
    header: 'Nome',
    cell: ({ row }) => {
      return <div className=" font-medium">{row.getValue('fiiName')}</div>
    },
  },
  {
    accessorKey: 'qty',
    header: 'Cotas',
    cell: ({ row }) => {
      return <div className=" font-medium">{row.getValue('qty')}</div>
    },
  },
  {
    accessorKey: 'quotationValue',
    header: 'Preço',
    cell: ({ row }) => {
      return (
        <div className=" font-medium">
          {currencyFormatter(row.getValue('quotationValue'))}
        </div>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Data" />
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.getValue('date'))
      const dateB = new Date(b.getValue('date'))

      if (dateA < dateB) {
        return -1
      }
      if (dateA > dateB) {
        return 1
      }
      return 0
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {format(new Date(row.getValue('date')), 'dd/MM/yyyy')}
        </div>
      )
    },
  },
]

export const dividendsColumns: ColumnDef<Dividend>[] = [
  {
    accessorKey: 'quotesAtPayment',
    header: 'Cotas',
    cell: ({ row }) => {
      return (
        <div className=" font-medium">{row.getValue('quotesAtPayment')}</div>
      )
    },
  },
  {
    accessorKey: 'paymentPerQuote',
    header: 'Por cota',
    cell: ({ row }) => {
      return (
        <div className=" font-medium">
          {currencyFormatter(row.getValue('paymentPerQuote'))}
        </div>
      )
    },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => {
      return (
        <div className=" font-medium">
          {currencyFormatter(row.getValue('total'))}
        </div>
      )
    },
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Data" />
    },
    sortingFn: (a, b) => {
      const dateA = new Date(a.getValue('date'))
      const dateB = new Date(b.getValue('date'))

      if (dateA < dateB) {
        return -1
      }
      if (dateA > dateB) {
        return 1
      }
      return 0
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {format(new Date(row.getValue('date')), 'dd/MM/yyyy')}
        </div>
      )
    },
  },
]