import React from 'react'
import { Box, Modal } from '@mui/material'

type ModalBoxProps = {
  modalOpen: boolean
  modalMessage: string
  setModalOpen: (open: boolean) => void
}

export const ModalBox: React.FC<React.PropsWithChildren<ModalBoxProps>> = ({ modalOpen, modalMessage, setModalOpen, children }) => {
  return (
    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <Box
        sx={{
          p: 4,
          bgcolor: 'white',
          border: '1px solid',
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        {children}
      </Box>
    </Modal>
  )
}

export default ModalBox