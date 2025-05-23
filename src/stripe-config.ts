export const products = {
  reservation: {
    id: 'prod_SIfG4h4isGA6Fc',
    priceId: 'price_1RO3wFGgFyMVirsQ8SvqRA1I',
    name: 'Reservation',
    description: '9 euros tarif de base + 2 euros par kms',
    mode: 'payment' as const,
  },
  airport: {
    id: 'prod_SHSEUtceBy1P2L',
    priceId: 'price_1RMtKAGgFyMVirsQOPVRxBcL',
    name: 'Transfert aéroport',
    description: 'Service de transport professionnel vers et depuis les aéroports',
    mode: 'payment' as const,
  },
} as const;

export type ProductId = keyof typeof products;