import {
  CandlestickSeries,
  ColorType,
  ISeriesApi,
  createChart,
} from 'lightweight-charts'
import React, { useEffect, useRef } from 'react'
import type { Hex } from 'viem'

import { useTimeseries } from '@/hooks/useTimeseries'

type ChartColors = {
  backgroundColor?: string
  textColor?: string
}

type ChartProps = {
  pool: Hex // Assuming Hex is a string alias
  colors?: ChartColors
}

export const ChartComponent: React.FC<ChartProps> = ({ pool, colors = {} }) => {
  const { fetchTimeseries } = useTimeseries()
  const { backgroundColor = '#161b33', textColor = '#f1dac4' } = colors

  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!chartContainerRef.current) return

    // Create the chart with advanced options.
    const chart = createChart(chartContainerRef.current, {
      autoSize: true, // Automatically resize to container dimensions
      height: 500, // Fallback height in pixels
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
        fontFamily: 'Roboto, sans-serif',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#363c4e' },
      },
      crosshair: {
        mode: 0, // Normal crosshair mode
        vertLine: {
          color: '#758696',
          width: 1,
          style: 0, // Solid line
          labelBackgroundColor: '#4c525e',
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 0,
          labelBackgroundColor: '#4c525e',
        },
      },
      priceScale: {
        autoScale: true,
        borderVisible: true,
        borderColor: '#2B2B43',
      },
      timeScale: {
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 10, // Margin space in bars from the right side
        barSpacing: 8, // Space between bars in pixels
        minBarSpacing: 0.5,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: false,
        rightBarStaysOnScroll: false,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000)
          return date.toLocaleDateString()
        },
        visible: true,
        ticksVisible: false,
        uniformDistribution: false,
        minimumHeight: 0,
        allowBoldLabels: true,
        ignoreWhitespaceIndices: false,
      },
      localization: {
        priceFormatter: (price: number) => `$${price.toFixed(2)}`,
      },
      handleScroll: true,
      handleScale: true,
      kineticScroll: true,
    })

    // Add a candlestick series with custom colors.
    const newSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderUpColor: '#4CAF50',
      borderDownColor: '#F44336',
      wickUpColor: '#4CAF50',
      wickDownColor: '#F44336',
    })

    // Fetch timeseries data and set it on the series.
    fetchTimeseries({ pool })
      .then((ts) => {
        if (!isMounted) return
        newSeries.setData(ts)
        seriesRef.current = newSeries
        chart.timeScale().fitContent()
      })
      .catch((err) => console.error(err))

    // Optionally handle container resizing.
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      isMounted = false
      window.removeEventListener('resize', handleResize)
      seriesRef.current = null
      chart.remove()
    }
  }, [pool, backgroundColor, textColor, fetchTimeseries])

  return <div ref={chartContainerRef} className="   w-[350px] h-[350px]" />
}

export function Candles(props: ChartProps) {
  return (
    <div>
      {/* Toolbar placeholder – extend with time range or other controls as needed */}
      <div className="chart-toolbar w-full flex gap-2 mt-30 md:mt-0  mb-2">
        <button className="px-2 py-1 bg-gray-700 text-white rounded text-sm">
          1D
        </button>
        <button className="px-2 py-1 bg-gray-700 text-white rounded text-sm">
          1W
        </button>
        <button className="px-2 py-1 bg-gray-700 text-white rounded text-sm">
          1M
        </button>
        <button className="px-2 py-1 bg-gray-700 text-white rounded text-sm">
          1Y
        </button>
      </div>
      <ChartComponent {...props} />
    </div>
  )
}
