import { motion } from 'framer-motion'
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomeHeader() {
  const navigate = useNavigate()

  return (
    <motion.button
      animate={{
        backgroundColor: [
          '#161b33', // Base color (blue)
          '#00FF00', // Flicker 1: green
          '#161b33', // Back to base
          '#00FF00', // Flicker 2: green
          '#161b33', // Back to base
        ],
        color: ['#f1dac4', '#0d0c1d', '#f1dac4', '#0d0c1d', '#f1dac4'],
      }}
      transition={{
        duration: 4, // Total duration for the sequence (3 seconds)
        times: [0, 0.2, 0.5, 0.8, 1],
        // One easing function per segment:
        ease: [
          [0.445, 0.05, 0.55, 0.95],
          [0.445, 0.05, 0.55, 0.95],
          [0.445, 0.05, 0.55, 0.95],
          [0.445, 0.05, 0.55, 0.95],
        ],
      }}
      onClick={() => navigate('/create')}
      className="hover:text-blue-600 mt-6 w-1/2 text-[var(--creamWhite)] rounded-xl transition border px-2 text-xl whitespace-nowrap h-16"
    >
      CREATE COIN
    </motion.button>
  )
}
