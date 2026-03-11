# Reference Documents

Este directorio contiene especificaciones tecnicas y documentos de referencia que abarcan multiples epicos o features del proyecto.

## Proposito

Los documentos aqui son **entry points** para la creacion de planes de implementacion detallados. Proporcionan contexto tecnico exhaustivo que puede ser referenciado al trabajar en stories especificas.

## Documentos Disponibles

| Documento                                                          | Descripcion                                                                                     | Epicos Relacionados        |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------- |
| [invoice-pdf-generation-spec.md](./invoice-pdf-generation-spec.md) | Especificacion tecnica completa del sistema de facturacion con generacion de PDF en tiempo real | `EPIC-SQ-20`, `EPIC-SQ-31` |

## Como Usar

1. **Antes de implementar**: Lee el documento de referencia relevante para entender la arquitectura completa
2. **Durante el planning**: Usa estos documentos para crear planes de implementacion por story
3. **Durante el desarrollo**: Referencia las secciones especificas (tipos, componentes, patrones)

## Estructura de Documentos

Cada documento de referencia sigue esta estructura:

- **Resumen Ejecutivo**: Vision general de la feature
- **Dependencias**: Librerias y versiones requeridas
- **Arquitectura**: Estructura de archivos y componentes
- **Tipos e Interfaces**: Definiciones TypeScript
- **Componentes**: Implementacion detallada de cada componente
- **Configuracion**: Archivos de configuracion necesarios
- **Puntos Criticos**: Errores comunes y como evitarlos
- **Checklist**: Lista de verificacion para la implementacion

---

**Ultima actualizacion**: 2026-02-08
