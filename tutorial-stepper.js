// ========================================
// TUTORIAL STEPPER - LYNX PUBLISHER
// Guided step-by-step tutorial system
// ========================================

const tutorialSteps = {
  'first-time': {
    title: '🚀 Publicando Seu Primeiro Projeto',
    description: 'Aprenda a publicar seu primeiro projeto no GitHub do zero',
    steps: [
      {
        id: 'login',
        number: 1,
        title: 'Faça Login no GitHub',
        summary: 'Autentique-se com sua conta GitHub',
        content: `
          <p>Para começar, você precisa estar autenticado no GitHub. Clique no botão "Login GitHub" no canto superior direito da tela.</p>
          <p>Uma janela do navegador será aberta automaticamente para você autorizar o acesso do Lynx Publisher à sua conta GitHub.</p>
        `,
        checklist: [
          { id: 'has-github-account', label: 'Ter uma conta no GitHub', status: 'pending' },
          { id: 'github-cli-installed', label: 'GitHub CLI (gh) instalado', status: 'pending' },
          { id: 'logged-in', label: 'Login realizado com sucesso', status: 'pending' }
        ],
        tip: 'O status mudará de 🔴 para 🟢 quando o login for bem-sucedido.',
        cta: {
          label: 'Fazer Login',
          action: 'openLogin',
          why: 'Necessário para criar e gerenciar repositórios no GitHub'
        }
      },
      {
        id: 'select-project',
        number: 2,
        title: 'Selecione Seu Projeto',
        summary: 'Escolha a pasta ou arquivo ZIP do seu projeto',
        content: `
          <p>Agora você precisa selecionar o projeto que deseja publicar no GitHub.</p>
          <p>Você pode escolher:</p>
          <ul>
            <li><strong>📁 Pasta:</strong> Selecione uma pasta existente no seu computador</li>
            <li><strong>📦 ZIP:</strong> Selecione um arquivo ZIP que será extraído automaticamente</li>
          </ul>
          <p>O Lynx Publisher analisará automaticamente seu projeto e verificará:</p>
        `,
        checklist: [
          { id: 'git-initialized', label: 'Git inicializado', status: 'pending' },
          { id: 'remote-configured', label: 'Repositório remoto configurado', status: 'pending' },
          { id: 'main-branch', label: 'Branch main existe', status: 'pending' }
        ],
        tip: 'Se o Git não estiver inicializado, o Lynx Publisher fará isso automaticamente.',
        cta: {
          label: 'Selecionar Projeto',
          action: 'selectProject',
          why: 'O aplicativo precisa saber qual código você quer publicar'
        }
      },
      {
        id: 'configure-repo',
        number: 3,
        title: 'Configure o Repositório',
        summary: 'Crie um novo repositório ou conecte a um existente',
        content: `
          <p>Você tem duas opções para configurar seu repositório no GitHub:</p>
          <div class="stepper-options">
            <div class="stepper-option">
              <div class="stepper-option-icon">🆕</div>
              <div class="stepper-option-content">
                <h4>Criar Novo Repositório</h4>
                <p>Digite um nome para o repositório e escolha se será público ou privado. O Lynx Publisher criará tudo automaticamente.</p>
              </div>
            </div>
            <div class="stepper-option">
              <div class="stepper-option-icon">🔗</div>
              <div class="stepper-option-content">
                <h4>Conectar a Repositório Existente</h4>
                <p>Se você já criou um repositório no GitHub, pode conectá-lo ao seu projeto local.</p>
              </div>
            </div>
          </div>
        `,
        checklist: [
          { id: 'repo-name-chosen', label: 'Nome do repositório definido', status: 'pending' },
          { id: 'visibility-chosen', label: 'Visibilidade escolhida (público/privado)', status: 'pending' }
        ],
        tip: 'Escolha um nome descritivo e sem espaços (use hífens: meu-projeto).',
        cta: {
          label: 'Configurar Repositório',
          action: 'configureRepo',
          why: 'Define onde seu código será armazenado no GitHub'
        }
      },
      {
        id: 'publish',
        number: 4,
        title: 'Publique no GitHub',
        summary: 'Envie seu código para o GitHub',
        content: `
          <p>Agora é hora de publicar! Clique no botão "🚀 Publicar Projeto".</p>
          <p>O Lynx Publisher executará automaticamente os seguintes comandos:</p>
          <div class="stepper-command-list">
            <div class="stepper-command">
              <code>git init</code>
              <span>Inicializa o Git (se necessário)</span>
            </div>
            <div class="stepper-command">
              <code>git add .</code>
              <span>Adiciona todos os arquivos</span>
            </div>
            <div class="stepper-command">
              <code>git commit -m "Initial commit"</code>
              <span>Cria o primeiro commit</span>
            </div>
            <div class="stepper-command">
              <code>gh repo create</code>
              <span>Cria o repositório no GitHub</span>
            </div>
            <div class="stepper-command">
              <code>git push -u origin main</code>
              <span>Envia o código para o GitHub</span>
            </div>
          </div>
        `,
        checklist: [
          { id: 'files-added', label: 'Arquivos adicionados ao Git', status: 'pending' },
          { id: 'first-commit', label: 'Primeiro commit criado', status: 'pending' },
          { id: 'repo-created', label: 'Repositório criado no GitHub', status: 'pending' },
          { id: 'code-pushed', label: 'Código enviado para o GitHub', status: 'pending' }
        ],
        tip: 'Este processo pode levar alguns segundos. Aguarde a confirmação.',
        cta: {
          label: 'Publicar Projeto',
          action: 'publishProject',
          why: 'Torna seu código acessível online e versionado'
        }
      },
      {
        id: 'success',
        number: 5,
        title: 'Pronto! 🎉',
        summary: 'Seu projeto está no GitHub',
        content: `
          <p>Parabéns! Seu projeto foi publicado com sucesso no GitHub.</p>
          <p>Agora você pode:</p>
          <ul>
            <li>✅ Fazer commits das suas alterações</li>
            <li>✅ Enviar atualizações com push</li>
            <li>✅ Baixar alterações com pull</li>
            <li>✅ Criar branches para novas funcionalidades</li>
            <li>✅ Colaborar com outras pessoas</li>
          </ul>
          <p>Use as ações rápidas que apareceram na tela para gerenciar seu projeto.</p>
        `,
        checklist: [
          { id: 'project-online', label: 'Projeto disponível no GitHub', status: 'done' },
          { id: 'quick-actions', label: 'Ações rápidas disponíveis', status: 'done' }
        ],
        tip: 'Visite github.com/seu-usuario/seu-projeto para ver seu código online!',
        cta: {
          label: 'Ver no GitHub',
          action: 'openGitHub',
          why: 'Confirme que tudo foi publicado corretamente'
        }
      }
    ]
  },
  
  'daily-workflow': {
    title: '💼 Fluxo de Trabalho Diário',
    description: 'Aprenda o ciclo de trabalho diário com Git',
    steps: [
      {
        id: 'pull-changes',
        number: 1,
        title: 'Baixe as Últimas Alterações',
        summary: 'Sincronize com o repositório remoto',
        content: `
          <p>Sempre comece seu dia de trabalho baixando as últimas alterações do GitHub.</p>
          <p>Isso garante que você está trabalhando com a versão mais recente do código.</p>
        `,
        checklist: [
          { id: 'pull-executed', label: 'git pull executado', status: 'pending' },
          { id: 'no-conflicts', label: 'Sem conflitos', status: 'pending' }
        ],
        tip: 'Faça pull antes de começar a trabalhar para evitar conflitos.',
        cta: {
          label: 'Fazer Pull',
          action: 'gitPull',
          why: 'Mantém seu código sincronizado com a equipe'
        }
      },
      {
        id: 'make-changes',
        number: 2,
        title: 'Faça Suas Alterações',
        summary: 'Edite, adicione ou remova arquivos',
        content: `
          <p>Trabalhe normalmente no seu projeto:</p>
          <ul>
            <li>Edite arquivos existentes</li>
            <li>Crie novos arquivos</li>
            <li>Delete arquivos desnecessários</li>
          </ul>
          <p>O Git rastreará todas as suas alterações automaticamente.</p>
        `,
        checklist: [
          { id: 'changes-made', label: 'Alterações realizadas', status: 'pending' }
        ],
        tip: 'Faça alterações pequenas e focadas para facilitar o controle.',
        cta: {
          label: 'Ver Status',
          action: 'gitStatus',
          why: 'Veja quais arquivos foram modificados'
        }
      },
      {
        id: 'stage-changes',
        number: 3,
        title: 'Adicione os Arquivos',
        summary: 'Prepare as alterações para commit',
        content: `
          <p>Adicione os arquivos que você quer incluir no próximo commit.</p>
          <p>Você pode adicionar:</p>
          <ul>
            <li><strong>Todos os arquivos:</strong> Use "git add ."</li>
            <li><strong>Arquivos específicos:</strong> Selecione individualmente</li>
          </ul>
        `,
        checklist: [
          { id: 'files-staged', label: 'Arquivos adicionados', status: 'pending' }
        ],
        tip: 'Revise os arquivos antes de adicionar para não incluir nada indesejado.',
        cta: {
          label: 'Adicionar Arquivos',
          action: 'gitAdd',
          why: 'Prepara as alterações para serem salvas'
        }
      },
      {
        id: 'commit',
        number: 4,
        title: 'Faça um Commit',
        summary: 'Salve suas alterações com uma mensagem',
        content: `
          <p>Crie um commit com uma mensagem descritiva do que você fez.</p>
          <p>Use os tipos convencionais:</p>
          <ul>
            <li><code>feat:</code> Nova funcionalidade</li>
            <li><code>fix:</code> Correção de bug</li>
            <li><code>docs:</code> Documentação</li>
            <li><code>style:</code> Formatação</li>
            <li><code>refactor:</code> Refatoração</li>
          </ul>
        `,
        checklist: [
          { id: 'commit-created', label: 'Commit criado', status: 'pending' },
          { id: 'good-message', label: 'Mensagem descritiva', status: 'pending' }
        ],
        tip: 'Escreva mensagens claras: "feat: adiciona botão de login"',
        cta: {
          label: 'Fazer Commit',
          action: 'gitCommit',
          why: 'Salva um ponto na história do seu código'
        }
      },
      {
        id: 'push',
        number: 5,
        title: 'Envie para o GitHub',
        summary: 'Publique suas alterações',
        content: `
          <p>Envie seus commits para o GitHub com git push.</p>
          <p>Isso torna suas alterações visíveis para toda a equipe e cria um backup na nuvem.</p>
        `,
        checklist: [
          { id: 'pushed', label: 'Alterações enviadas', status: 'pending' },
          { id: 'visible-online', label: 'Visível no GitHub', status: 'pending' }
        ],
        tip: 'Faça push regularmente para não perder trabalho.',
        cta: {
          label: 'Fazer Push',
          action: 'gitPush',
          why: 'Compartilha seu trabalho e cria backup'
        }
      }
    ]
  },
  
  'branches': {
    title: '🌿 Gerenciar Branches',
    description: 'Aprenda a criar e trabalhar com branches',
    steps: [
      {
        id: 'understand-branches',
        number: 1,
        title: 'O que são Branches?',
        summary: 'Entenda o conceito de branches',
        content: `
          <p>Branches (ramificações) são linhas paralelas de desenvolvimento. Elas permitem que você:</p>
          <ul>
            <li>Trabalhe em novas funcionalidades sem afetar o código principal</li>
            <li>Teste mudanças experimentais com segurança</li>
            <li>Colabore com outras pessoas sem conflitos</li>
            <li>Organize seu trabalho por contexto (feature, bugfix, etc.)</li>
          </ul>
          <p>A branch principal geralmente se chama <code>main</code> ou <code>master</code>.</p>
        `,
        checklist: [
          { id: 'concept-understood', label: 'Conceito de branches compreendido', status: 'pending' }
        ],
        tip: 'Pense em branches como "universos paralelos" do seu código.',
        cta: {
          label: 'Ver Branches Existentes',
          action: 'refreshBranches',
          why: 'Veja quais branches já existem no seu projeto'
        }
      },
      {
        id: 'create-branch',
        number: 2,
        title: 'Criar Nova Branch',
        summary: 'Crie uma branch para sua funcionalidade',
        content: `
          <p>Para criar uma nova branch, siga estas convenções de nomenclatura:</p>
          <ul>
            <li><code>feature/nome-da-funcionalidade</code> - Para novas funcionalidades</li>
            <li><code>bugfix/nome-do-bug</code> - Para correções de bugs</li>
            <li><code>hotfix/problema-urgente</code> - Para correções urgentes</li>
            <li><code>refactor/nome-da-refatoracao</code> - Para refatorações</li>
          </ul>
          <p>Use nomes descritivos e em minúsculas, separados por hífens.</p>
        `,
        checklist: [
          { id: 'branch-name-chosen', label: 'Nome da branch definido', status: 'pending' },
          { id: 'branch-created', label: 'Branch criada', status: 'pending' }
        ],
        tip: 'Exemplo: feature/adicionar-login ou bugfix/corrigir-menu',
        cta: {
          label: 'Criar Branch',
          action: 'createBranch',
          why: 'Cria um espaço isolado para suas alterações'
        }
      },
      {
        id: 'switch-branch',
        number: 3,
        title: 'Trocar de Branch',
        summary: 'Navegue entre diferentes branches',
        content: `
          <p>Você pode trocar entre branches a qualquer momento. Ao trocar:</p>
          <ul>
            <li>Os arquivos no seu projeto mudam para refletir a branch selecionada</li>
            <li>Suas alterações não salvas podem ser perdidas (faça commit antes!)</li>
            <li>Você pode trabalhar em múltiplas funcionalidades alternando branches</li>
          </ul>
          <p>A branch atual é indicada com <strong>(atual)</strong> na lista.</p>
        `,
        checklist: [
          { id: 'branch-switched', label: 'Branch trocada com sucesso', status: 'pending' }
        ],
        tip: 'Sempre faça commit das suas alterações antes de trocar de branch.',
        cta: {
          label: 'Trocar Branch',
          action: 'switchBranch',
          why: 'Permite trabalhar em diferentes contextos'
        }
      },
      {
        id: 'work-on-branch',
        number: 4,
        title: 'Trabalhe na Branch',
        summary: 'Faça alterações e commits',
        content: `
          <p>Agora você pode trabalhar normalmente na sua branch:</p>
          <div class="stepper-command-list">
            <div class="stepper-command">
              <code>Edite arquivos</code>
              <span>Faça suas alterações</span>
            </div>
            <div class="stepper-command">
              <code>git add .</code>
              <span>Adicione os arquivos</span>
            </div>
            <div class="stepper-command">
              <code>git commit</code>
              <span>Salve as alterações</span>
            </div>
          </div>
          <p>Todas as alterações ficam isoladas nesta branch.</p>
        `,
        checklist: [
          { id: 'changes-made', label: 'Alterações realizadas', status: 'pending' },
          { id: 'changes-committed', label: 'Alterações commitadas', status: 'pending' }
        ],
        tip: 'Faça commits pequenos e frequentes com mensagens claras.',
        cta: {
          label: 'Ir para Git',
          action: 'goToGit',
          why: 'Acesse as ferramentas de commit'
        }
      },
      {
        id: 'push-branch',
        number: 5,
        title: 'Enviar Branch para GitHub',
        summary: 'Publique sua branch no repositório remoto',
        content: `
          <p>Envie sua branch para o GitHub para:</p>
          <ul>
            <li>Fazer backup do seu trabalho</li>
            <li>Compartilhar com a equipe</li>
            <li>Criar um Pull Request (PR)</li>
            <li>Permitir revisão de código</li>
          </ul>
          <p>Use o botão "Push" ao lado da branch na lista.</p>
        `,
        checklist: [
          { id: 'branch-pushed', label: 'Branch enviada para GitHub', status: 'pending' }
        ],
        tip: 'A primeira vez que você fizer push, a branch será criada no GitHub.',
        cta: {
          label: 'Push Branch',
          action: 'pushBranch',
          why: 'Torna seu trabalho visível e seguro'
        }
      },
      {
        id: 'merge-branch',
        number: 6,
        title: 'Mesclar Branch (Merge)',
        summary: 'Integre suas alterações na branch principal',
        content: `
          <p>Quando sua funcionalidade estiver pronta, você pode mesclar (merge) na branch principal:</p>
          <div class="stepper-options">
            <div class="stepper-option">
              <div class="stepper-option-icon">🌐</div>
              <div class="stepper-option-content">
                <h4>Via Pull Request (Recomendado)</h4>
                <p>Crie um PR no GitHub para revisão de código antes de mesclar.</p>
              </div>
            </div>
            <div class="stepper-option">
              <div class="stepper-option-icon">⚡</div>
              <div class="stepper-option-content">
                <h4>Merge Local</h4>
                <p>Mescle diretamente usando comandos Git (para projetos pessoais).</p>
              </div>
            </div>
          </div>
        `,
        checklist: [
          { id: 'pr-created', label: 'Pull Request criado (se aplicável)', status: 'pending' },
          { id: 'branch-merged', label: 'Branch mesclada', status: 'pending' }
        ],
        tip: 'Pull Requests permitem revisão e discussão antes de mesclar.',
        cta: {
          label: 'Abrir GitHub',
          action: 'openGitHub',
          why: 'Crie um Pull Request no GitHub'
        }
      }
    ]
  },
  
  'gitignore': {
    title: '🚫 Configurar .gitignore',
    description: 'Aprenda a ignorar arquivos desnecessários',
    steps: [
      {
        id: 'understand-gitignore',
        number: 1,
        title: 'O que é .gitignore?',
        summary: 'Entenda por que ignorar arquivos',
        content: `
          <p>O arquivo <code>.gitignore</code> diz ao Git quais arquivos e pastas ele deve ignorar.</p>
          <p>Você deve ignorar:</p>
          <ul>
            <li><strong>Dependências:</strong> node_modules, vendor, etc.</li>
            <li><strong>Arquivos de build:</strong> dist, build, *.min.js</li>
            <li><strong>Arquivos do sistema:</strong> .DS_Store, Thumbs.db</li>
            <li><strong>Configurações locais:</strong> .env, config.local.js</li>
            <li><strong>Arquivos temporários:</strong> *.log, *.tmp</li>
          </ul>
          <p>Isso mantém seu repositório limpo e reduz o tamanho.</p>
        `,
        checklist: [
          { id: 'concept-understood', label: 'Conceito de .gitignore compreendido', status: 'pending' }
        ],
        tip: 'Nunca commite senhas, tokens ou arquivos grandes!',
        cta: {
          label: 'Ver .gitignore Atual',
          action: 'viewGitignore',
          why: 'Veja o que já está sendo ignorado'
        }
      },
      {
        id: 'common-patterns',
        number: 2,
        title: 'Padrões Comuns',
        summary: 'Adicione padrões essenciais',
        content: `
          <p>Clique em "Adicionar Padrões Comuns" para incluir automaticamente:</p>
          <div class="stepper-command-list">
            <div class="stepper-command">
              <code>node_modules/</code>
              <span>Dependências do Node.js</span>
            </div>
            <div class="stepper-command">
              <code>.env</code>
              <span>Variáveis de ambiente</span>
            </div>
            <div class="stepper-command">
              <code>dist/</code>
              <span>Arquivos compilados</span>
            </div>
            <div class="stepper-command">
              <code>.DS_Store</code>
              <span>Arquivos do macOS</span>
            </div>
            <div class="stepper-command">
              <code>*.log</code>
              <span>Arquivos de log</span>
            </div>
          </div>
        `,
        checklist: [
          { id: 'common-patterns-added', label: 'Padrões comuns adicionados', status: 'pending' }
        ],
        tip: 'Estes padrões cobrem a maioria dos projetos web.',
        cta: {
          label: 'Adicionar Padrões Comuns',
          action: 'addCommonPatterns',
          why: 'Protege seu repositório de arquivos desnecessários'
        }
      },
      {
        id: 'custom-patterns',
        number: 3,
        title: 'Padrões Personalizados',
        summary: 'Adicione regras específicas do seu projeto',
        content: `
          <p>Você pode adicionar padrões personalizados no editor:</p>
          <ul>
            <li><code>arquivo.txt</code> - Ignora arquivo específico</li>
            <li><code>pasta/</code> - Ignora pasta inteira</li>
            <li><code>*.extensao</code> - Ignora todos os arquivos com essa extensão</li>
            <li><code>!importante.log</code> - Exceção (não ignora este arquivo)</li>
            <li><code>**/temp</code> - Ignora pasta "temp" em qualquer nível</li>
          </ul>
        `,
        checklist: [
          { id: 'custom-patterns-added', label: 'Padrões personalizados adicionados', status: 'pending' }
        ],
        tip: 'Use # para comentários no .gitignore',
        cta: {
          label: 'Editar .gitignore',
          action: 'editGitignore',
          why: 'Personalize para as necessidades do seu projeto'
        }
      },
      {
        id: 'save-gitignore',
        number: 4,
        title: 'Salvar Alterações',
        summary: 'Aplique as configurações',
        content: `
          <p>Depois de editar o .gitignore, clique em "Salvar" para aplicar as alterações.</p>
          <p>O que acontece:</p>
          <ul>
            <li>O arquivo .gitignore é atualizado no seu projeto</li>
            <li>O Git passa a ignorar os arquivos especificados</li>
            <li>Arquivos já commitados não são afetados</li>
          </ul>
          <p>Se você já commitou arquivos que agora quer ignorar, precisará removê-los do Git primeiro.</p>
        `,
        checklist: [
          { id: 'gitignore-saved', label: '.gitignore salvo', status: 'pending' }
        ],
        tip: 'Faça commit do .gitignore para compartilhar com a equipe.',
        cta: {
          label: 'Salvar .gitignore',
          action: 'saveGitignore',
          why: 'Aplica as regras de ignorar arquivos'
        }
      },
      {
        id: 'verify-gitignore',
        number: 5,
        title: 'Verificar Funcionamento',
        summary: 'Confirme que os arquivos estão sendo ignorados',
        content: `
          <p>Para verificar se o .gitignore está funcionando:</p>
          <div class="stepper-command-list">
            <div class="stepper-command">
              <code>git status</code>
              <span>Veja quais arquivos o Git está rastreando</span>
            </div>
          </div>
          <p>Os arquivos ignorados não devem aparecer na lista de "Untracked files".</p>
          <p>Se um arquivo ainda aparece:</p>
          <ul>
            <li>Verifique se o padrão está correto no .gitignore</li>
            <li>Se o arquivo já foi commitado, use <code>git rm --cached arquivo</code></li>
          </ul>
        `,
        checklist: [
          { id: 'gitignore-verified', label: 'Funcionamento verificado', status: 'pending' }
        ],
        tip: 'Use a aba Git para executar git status facilmente.',
        cta: {
          label: 'Ver Status',
          action: 'gitStatus',
          why: 'Confirme que os arquivos corretos estão sendo ignorados'
        }
      }
    ]
  }
};

// Exportar para uso global
window.tutorialSteps = tutorialSteps;
