import {
  CandlestickSeries,
  ColorType,
  ISeriesApi,
  createChart,
} from 'lightweight-charts'
import React, { useEffect, useRef } from 'react'
import { Hex } from 'viem'

import { useTimeseries } from '@/hooks/useTimeseries'

type ChartColors = {
  backgroundColor?: string
  lineColor?: string
  textColor?: string
  areaTopColor?: string
  areaBottomColor?: string
}

type ChartProps = {
  pool: Hex
  colors?: ChartColors
}

export const ChartComponent: React.FC<ChartProps> = ({ pool, colors = {} }) => {
  const { fetchTimeseries } = useTimeseries()

  const { backgroundColor = 'white', textColor = 'black' } = colors

  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>()

  useEffect(() => {
    if (!chartContainerRef || !chartContainerRef.current) {
      return
    }

    const handleResize = () => {
      if (!chartContainerRef.current) {
        return
      }
      chart.applyOptions({ width: chartContainerRef.current.clientWidth })
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000)
          return date.toLocaleTimeString()
        },
      },
    })
    chart.timeScale().fitContent()
    const newSeries = chart.addSeries(CandlestickSeries, {})

    fetchTimeseries({ pool }).then((ts) => {
      newSeries.setData(ts)
      seriesRef.current = newSeries
    })

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      seriesRef.current = undefined
      chart.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, backgroundColor, textColor])

  //   useEffect(() => {
  //     if (!seriesRef) {
  //       return
  //     }
  //     const interval = setInterval(() => {
  //       if (!seriesRef.current) {
  //         return
  //       }
  //       const r = Math.random()
  //       const datapoint = {
  //         time: '2019-05-25',
  //         open: 192.54 + r,
  //         high: 193.86 + r,
  //         low: 190.41 + r,
  //         close: 193.59 + r,
  //       }
  //       seriesRef.current.update(datapoint)
  //     }, 5_000)

  //     return () => clearInterval(interval)
  //   }, [seriesRef])

  return <div ref={chartContainerRef} />
}

export function Candles(props: ChartProps) {
  return <ChartComponent {...props}></ChartComponent>
}
