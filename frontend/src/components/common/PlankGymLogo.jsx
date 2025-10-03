// frontend/src/components/common/PlankGymLogo.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Componente reutilizável para exibir o logo do PlankGYM com opções de tamanho
 * 
 * @param {Object} props - Propriedades do componente
 * @param {string} props.size - Tamanho do logo: 'small', 'medium', 'large' ou um valor personalizado em px
 * @param {boolean} props.showText - Se deve mostrar o texto "PlankGYM" ao lado do logo
 * @param {Object} props.textProps - Propriedades adicionais para o componente Typography
 * @returns {JSX.Element} Componente de logo
 */
function PlankGymLogo({ size = 'medium', showText = true, textProps = {} }) {
  // Define tamanhos padrão em pixels
  const sizes = {
    small: '40px',
    medium: '60px',
    large: '120px'
  };
  
  // Calcula o tamanho real a ser utilizado
  const logoSize = sizes[size] || size;
  
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <img 
        src="/assets/logos/plankgym/logo-main.png" 
        alt="PlankGYM Logo" 
        style={{ height: logoSize, marginRight: showText ? "16px" : "0" }} 
      />
      {showText && (
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ fontWeight: "bold", color: "#2E7D32", ...textProps?.sx }}
          {...textProps}
        >
          PlankGYM
        </Typography>
      )}
    </Box>
  );
}

export default PlankGymLogo;