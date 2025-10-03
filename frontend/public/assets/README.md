# Assets do PlankGYM

Este diretório contém todos os recursos visuais utilizados no sistema PlankGYM.

## Estrutura de Diretórios

```
assets/
├── icons/             # Ícones e favicons
│   └── favicon.png    # Favicon do sistema
├── logos/             # Logotipos da marca
│   └── plankgym/      # Variações do logo PlankGYM
│       ├── logo-main.png      # Logo principal
│       └── logo-favicon.png   # Versão para favicon
```

## Uso dos Recursos

### Logotipos
- `logo-main.png`: Utilizado nos cabeçalhos e páginas de login
- `logo-favicon.png`: Versão otimizada para uso como favicon

### Ícones
- `favicon.png`: Ícone que aparece na aba do navegador

## Diretrizes de Uso

1. **Referenciamento**: Sempre referencie os assets usando caminhos relativos a partir da raiz:
   ```jsx
   <img src="/assets/logos/plankgym/logo-main.png" alt="PlankGYM Logo" />
   ```

2. **Tamanhos recomendados**:
   - Cabeçalho principal: 60px de altura
   - Barra lateral: 40px de altura
   - Páginas de login: 120px de altura

3. **Formatos**:
   - Prefira usar PNG para logotipos e ícones que requerem transparência
   - Use SVG sempre que possível para ícones de interface

## Cores Institucionais

- Verde primário: `#2E7D32`
- Verde claro: `#4CAF50`
- Verde escuro: `#1B5E20`
- Laranja (cor de destaque): `#FF5722`