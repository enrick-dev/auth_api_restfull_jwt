import { I18n } from 'i18n';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const i18n = new I18n({
  locales: ['pt-br', 'es-mx'],
  directory: path.join(__dirname, 'translation'),
  defaultLocale: 'pt-br',
});

export { i18n };
