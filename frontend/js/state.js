// Estado compartido entre el stepper y el simulador.
export const appState = {
  countryId: null,
  categoryId: null,
  productId: null,
  incoterm: null, // 'EXW' | 'FOB' | 'CIF'
  fobOverride: null, // precio FOB manual opcional, del paso 2
  offerId: null, // oferta (manufacturer + precio) elegida en el paso 3
};
