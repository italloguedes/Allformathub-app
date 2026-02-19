export const translations = {
    en: {
        // Header
        converter: "Converter",
        mergePdfNav: "Merge PDF",
        about: "About",
        privacy: "Privacy",

        // Landing
        heroTitle: "Convert files between formats.",
        heroSubtitle: "No sign-up required.",
        heroDescription:
            "A straightforward file conversion tool. Upload your files, pick a target format, and download the result. Processing happens on the server and files are deleted automatically.",
        openConverter: "Open converter",
        learnMore: "Learn more",
        multipleFormats: "Multiple formats",
        multipleFormatsDesc:
            "Images, documents, audio, video, and archives. Convert between common formats within each category.",
        batchProcessing: "Batch processing",
        batchProcessingDesc:
            "Upload multiple files at once. Convert and download them individually or as a single archive.",
        fastProcessing: "Fast processing",
        fastProcessingDesc:
            "Conversion jobs run concurrently with queue management to balance speed and server resources.",
        autoCleanup: "Automatic cleanup",
        autoCleanupDesc:
            "Uploaded and converted files are deleted from the server automatically after a short retention period.",
        supportedFormats: "Supported formats",
        images: "Images",
        documents: "Documents",
        spreadsheets: "Spreadsheets",
        audio: "Audio",
        video: "Video",
        archives: "Archives",

        // Converter
        fileConverter: "File converter",
        fileConverterDesc:
            "Upload files, select the target format, and download the converted result.",
        mergePdfPageTitle: "Merge Files Into One PDF",
        mergePdfPageDesc:
            "Upload files, reorder them, rename the output, preview, and generate a single PDF.",
        dropFiles: "Drop files here, or click to browse",
        dropFilesHint: "Images, documents, audio, video, archives",
        uploading: "Uploading...",
        filesQueued: (n: number) => `${n} file${n !== 1 ? "s" : ""} queued`,
        downloadAll: (n: number) => `Download all (${n})`,
        convertAll: "Convert all",
        mergeToPdf: "Merge to PDF",
        merging: "Merging...",
        mergedPdfReady: "Merged PDF ready",
        downloadMergedPdf: "Download merged PDF",
        mergeRequireTwo: "Add at least 2 valid files to enable merge.",
        mergeWindowTitle: "Merge Files Into One PDF",
        mergeWindowDesc: "Rename the output, reorder files, and preview before generating.",
        outputPdfName: "Output PDF name",
        filesInOrder: "Files in final order",
        preview: "Preview",
        moveUp: "Move up",
        moveDown: "Move down",
        close: "Close",
        convert: "Convert",
        processing: "Processing",
        done: "Done",
        failed: "Failed",
        selectFormat: "Select format",
        noConversions: (ext: string) => `No conversions available for .${ext}`,
        supportedFormatsHint: "Supported formats: images, documents, audio, video, and archives",
        noPreview: "No preview available for this file type",
        rejected: (n: number) => `${n} file(s) rejected`,

        // Format categories
        catImage: "Image",
        catDocument: "Document",
        catSpreadsheet: "Spreadsheet",
        catAudio: "Audio",
        catVideo: "Video",
        catArchive: "Archive",

        // About
        aboutTitle: "About",
        aboutP1:
            "All Format Hub is a file conversion tool designed to handle common format transformations without requiring account creation, software installation, or recurring subscriptions.",
        aboutP2:
            "It supports conversion between image, document, audio, video, and archive formats. Files are processed on the server using established open-source libraries: sharp for images, ffmpeg for audio and video, and archiver for compressed files.",
        howItWorks: "How it works",
        howStep1: "Upload one or more files using the converter page.",
        howStep2:
            "Select the desired output format for each file. Only valid target formats are shown based on the input type.",
        howStep3:
            "Start the conversion. Jobs are processed concurrently with a configurable concurrency limit.",
        howStep4: "Download the converted files individually or as a batch.",
        fileHandling: "File handling",
        fileHandlingDesc:
            "All uploaded and converted files are stored temporarily and deleted automatically after a short retention period. No files are kept permanently. The application does not require authentication and does not collect any personal data beyond what is necessary to process the conversion request.",
        techDetails: "Technical details",
        techDetailsDesc:
            "Built with Next.js, TypeScript, and TailwindCSS. The conversion engine uses sharp for image processing, ffmpeg for audio and video transcoding, pdf-lib for PDF manipulation, and archiver for creating compressed archives.",

        // Privacy
        privacyTitle: "Privacy Policy",
        privacyIntro: "This policy explains how All Format Hub handles data when you use the service.",
        dataCollection: "Data collection",
        dataCollectionDesc:
            "All Format Hub does not require account creation or authentication. We do not collect personal information such as names, email addresses, or usage analytics.",
        privacyFileHandling: "File handling",
        privacyFileHandlingP1:
            "Files uploaded for conversion are stored temporarily on the server to facilitate the conversion process. Both the original uploaded files and the resulting converted files are automatically deleted after a configurable retention period (default: 30 minutes).",
        privacyFileHandlingP2:
            "Files are not shared with third parties, not used for training purposes, and not retained beyond the stated retention period.",
        security: "Security",
        securityDesc:
            "Uploaded files are validated for type, size, and extension before processing. Executable files and known dangerous formats are rejected. Download links are protected with unique tokens that are valid only for the duration of the file retention period.",
        cookies: "Cookies and local storage",
        cookiesDesc:
            "All Format Hub uses localStorage to save your theme and language preferences. No tracking cookies are used.",
        changes: "Changes",
        changesDesc: "This policy may be updated. Any changes will be reflected on this page.",

        // Footer
        footerNote: "Files are processed locally and deleted automatically.",

        // Language
        language: "Language",
    },

    pt: {
        // Header
        converter: "Conversor",
        mergePdfNav: "Juntar PDF",
        about: "Sobre",
        privacy: "Privacidade",

        // Landing
        heroTitle: "Converta arquivos entre formatos.",
        heroSubtitle: "Sem necessidade de cadastro.",
        heroDescription:
            "Uma ferramenta direta de conversao de arquivos. Envie seus arquivos, escolha o formato de destino e baixe o resultado. O processamento acontece no servidor e os arquivos sao excluidos automaticamente.",
        openConverter: "Abrir conversor",
        learnMore: "Saiba mais",
        multipleFormats: "Multiplos formatos",
        multipleFormatsDesc:
            "Imagens, documentos, audio, video e arquivos compactados. Converta entre formatos comuns dentro de cada categoria.",
        batchProcessing: "Processamento em lote",
        batchProcessingDesc:
            "Envie multiplos arquivos de uma vez. Converta e baixe individualmente ou como um arquivo unico.",
        fastProcessing: "Processamento rapido",
        fastProcessingDesc:
            "As conversoes sao executadas simultaneamente com gerenciamento de fila para equilibrar velocidade e recursos do servidor.",
        autoCleanup: "Limpeza automatica",
        autoCleanupDesc:
            "Arquivos enviados e convertidos sao excluidos do servidor automaticamente apos um curto periodo de retencao.",
        supportedFormats: "Formatos suportados",
        images: "Imagens",
        documents: "Documentos",
        spreadsheets: "Planilhas",
        audio: "Audio",
        video: "Video",
        archives: "Arquivos compactados",

        // Converter
        fileConverter: "Conversor de arquivos",
        fileConverterDesc:
            "Envie arquivos, selecione o formato de destino e baixe o resultado convertido.",
        mergePdfPageTitle: "Juntar Arquivos em Um PDF",
        mergePdfPageDesc:
            "Envie arquivos, organize a ordem, renomeie o arquivo final, visualize e gere um unico PDF.",
        dropFiles: "Arraste arquivos aqui ou clique para selecionar",
        dropFilesHint: "Imagens, documentos, audio, video, arquivos compactados",
        uploading: "Enviando...",
        filesQueued: (n: number) => `${n} arquivo${n !== 1 ? "s" : ""} na fila`,
        downloadAll: (n: number) => `Baixar todos (${n})`,
        convertAll: "Converter todos",
        mergeToPdf: "Juntar em PDF",
        merging: "Juntando...",
        mergedPdfReady: "PDF unificado pronto",
        downloadMergedPdf: "Baixar PDF unificado",
        mergeRequireTwo: "Adicione pelo menos 2 arquivos validos para habilitar a unificacao.",
        mergeWindowTitle: "Juntar Arquivos em Um PDF",
        mergeWindowDesc: "Renomeie o arquivo final, ordene os anexos e visualize antes de gerar.",
        outputPdfName: "Nome do PDF final",
        filesInOrder: "Arquivos na ordem final",
        preview: "Visualizar",
        moveUp: "Subir",
        moveDown: "Descer",
        close: "Fechar",
        convert: "Converter",
        processing: "Processando",
        done: "Concluido",
        failed: "Falhou",
        selectFormat: "Selecionar formato",
        noConversions: (ext: string) => `Nenhuma conversao disponivel para .${ext}`,
        supportedFormatsHint: "Formatos suportados: imagens, documentos, audio, video e arquivos compactados",
        noPreview: "Nenhuma visualizacao disponivel para este tipo de arquivo",
        rejected: (n: number) => `${n} arquivo(s) rejeitado(s)`,

        // Format categories
        catImage: "Imagem",
        catDocument: "Documento",
        catSpreadsheet: "Planilha",
        catAudio: "Audio",
        catVideo: "Video",
        catArchive: "Arquivo",

        // About
        aboutTitle: "Sobre",
        aboutP1:
            "All Format Hub e uma ferramenta de conversao de arquivos projetada para lidar com transformacoes de formato comuns sem exigir criacao de conta, instalacao de software ou assinaturas recorrentes.",
        aboutP2:
            "Suporta conversao entre formatos de imagem, documento, audio, video e arquivos compactados. Os arquivos sao processados no servidor usando bibliotecas de codigo aberto estabelecidas: sharp para imagens, ffmpeg para audio e video, e archiver para arquivos compactados.",
        howItWorks: "Como funciona",
        howStep1: "Envie um ou mais arquivos usando a pagina do conversor.",
        howStep2:
            "Selecione o formato de saida desejado para cada arquivo. Apenas formatos de destino validos sao exibidos com base no tipo de entrada.",
        howStep3:
            "Inicie a conversao. As tarefas sao processadas simultaneamente com um limite de concorrencia configuravel.",
        howStep4: "Baixe os arquivos convertidos individualmente ou em lote.",
        fileHandling: "Tratamento de arquivos",
        fileHandlingDesc:
            "Todos os arquivos enviados e convertidos sao armazenados temporariamente e excluidos automaticamente apos um curto periodo de retencao. Nenhum arquivo e mantido permanentemente. O aplicativo nao requer autenticacao e nao coleta dados pessoais alem do necessario para processar a solicitacao de conversao.",
        techDetails: "Detalhes tecnicos",
        techDetailsDesc:
            "Construido com Next.js, TypeScript e TailwindCSS. O motor de conversao usa sharp para processamento de imagens, ffmpeg para transcodificacao de audio e video, pdf-lib para manipulacao de PDF e archiver para criacao de arquivos compactados.",

        // Privacy
        privacyTitle: "Politica de Privacidade",
        privacyIntro: "Esta politica explica como o All Format Hub trata os dados quando voce usa o servico.",
        dataCollection: "Coleta de dados",
        dataCollectionDesc:
            "O All Format Hub nao exige criacao de conta ou autenticacao. Nao coletamos informacoes pessoais como nomes, enderecos de e-mail ou analises de uso.",
        privacyFileHandling: "Tratamento de arquivos",
        privacyFileHandlingP1:
            "Os arquivos enviados para conversao sao armazenados temporariamente no servidor para facilitar o processo de conversao. Tanto os arquivos originais enviados quanto os arquivos convertidos resultantes sao excluidos automaticamente apos um periodo de retencao configuravel (padrao: 30 minutos).",
        privacyFileHandlingP2:
            "Os arquivos nao sao compartilhados com terceiros, nao sao usados para fins de treinamento e nao sao retidos alem do periodo de retencao declarado.",
        security: "Seguranca",
        securityDesc:
            "Os arquivos enviados sao validados quanto ao tipo, tamanho e extensao antes do processamento. Arquivos executaveis e formatos perigosos conhecidos sao rejeitados. Os links de download sao protegidos com tokens unicos validos apenas durante o periodo de retencao do arquivo.",
        cookies: "Cookies e armazenamento local",
        cookiesDesc:
            "O All Format Hub usa localStorage para salvar suas preferencias de tema e idioma. Nenhum cookie de rastreamento e utilizado.",
        changes: "Alteracoes",
        changesDesc: "Esta politica pode ser atualizada. Quaisquer alteracoes serao refletidas nesta pagina.",

        // Footer
        footerNote: "Arquivos sao processados localmente e excluidos automaticamente.",

        // Language
        language: "Idioma",
    },
};

export type Locale = keyof typeof translations;
export type Translations = typeof translations.en;
