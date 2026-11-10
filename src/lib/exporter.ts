import JSZip from 'jszip';
import { LandingPageProject } from '@/types';

export async function createProjectZip(project: LandingPageProject): Promise<Blob> {
  const zip = new JSZip();

  const html = project.htmlContent || '<html><body>Demonstração</body></html>';

  // Add index.html
  zip.file('index.html', html);

  // Add a clean README.md
  const readme = `# Landing Page - ${project.businessName}

Esta landing page foi gerada sob medida pela **Plataforma de Prospecção Inteligente & Landing Pages com IA**.

## Como publicar esta página:

1. **Vercel / Netlify / Cloudflare Pages:**
   - Basta arrastar esta pasta ou fazer upload dos arquivos. O arquivo \`index.html\` já é totalmente autônomo e responsivo.

2. **Hospedagem Compartilhada (cPanel / Apache / Nginx):**
   - Envie os arquivos para a pasta \`public_html\` ou raiz do domínio/subdomínio.

3. **WhatsApp / Contatos:**
   - Os links de contato já estão pré-configurados com o número registrado do estabelecimento.

---
© ${new Date().getFullYear()} ${project.businessName}. Todos os direitos reservados.
`;

  zip.file('README.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}
