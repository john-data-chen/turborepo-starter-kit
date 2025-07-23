import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import path from 'path';
import React, { ReactElement } from 'react';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const messages = require(path.resolve(__dirname, '../../messages/en.json'));

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render, AllTheProviders };
