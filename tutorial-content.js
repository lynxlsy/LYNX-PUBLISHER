const tutorialContent = {
  'first-time': {
    title: '🚀 Publicando Seu Primeiro Projeto',
    content: `
      <div class="tutorial-section">
        <h3>🎯 Objetivo</h3>
        <p>Aprender a publicar seu primeiro projeto no GitHub usando o fluxo guiado do Lynx Publisher, passo a passo.</p>
      </div>

      <div class="tutorial-section">
        <h3>📋 Pré-requisitos</h3>
        <ul>
          <li>Ter uma conta no GitHub (gratuita)</li>
          <li>Ter o Git instalado no computador</li>
          <li>Ter o GitHub CLI (gh) instalado</li>
        </ul>
      </div>

      <div class="tutorial-section">
        <h3>🔄 Fluxo Guiado em 6 Passos</h3>
        <p>O Lynx Publisher tem um fluxo guiado que te leva passo a passo até publicar seu projeto:</p>
        
        <ol class="tutorial-steps">
          <li>
            <strong>Step 1: Login GitHub</strong>
            <p>Clique no botão "Login GitHub" no header. Uma janela do navegador abrirá para você autorizar o acesso.</p>
            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Dica</div>
                <div class="tutorial-tip-text">O indicador de status mudará para verde (✅) quando o login for bem-sucedido. Você verá seu nome de usuário no header.</div>
              </div>
            </div>
          </li>

          <li>
            <strong>Step 2: Selecionar Projeto</strong>
            <p>Clique em "📁 Selecionar Pasta" para escolher a pasta do seu projeto.</p>
            <p>O Lynx Publisher analisará automaticamente:</p>
            <ul>
              <li>✅ Se o Git já está inicializado</li>
              <li>✅ Se há um repositório remoto configurado</li>
              <li>✅ Qual branch está ativa</li>
            </ul>
            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Indicador de Projeto</div>
                <div class="tutorial-tip-text">No header, você verá o nome do projeto e o caminho completo. O "Project Health" mostrará o status geral.</div>
              </div>
            </div>
          </li>

          <li>
            <strong>Step 3: Verificar Git</strong>
            <p>Este step mostra o status do Git no seu projeto:</p>
            <ul>
              <li><strong>Status:</strong> ✅ Git OK ou ⚠️ Não inicializado</li>
              <li><strong>Branch:</strong> ✅ main ou ⚠️ outra branch</li>
              <li><strong>Remote:</strong> ✅ Configurado ou ❌ Não configurado</li>
            </ul>
            <p><strong>Ações disponíveis:</strong></p>
            <ul>
              <li>📊 Ver Status Detalhado - Mostra o <code>git status</code> completo</li>
              <li>🌿 Trocar para Main - Se você está em outra branch</li>
              <li>🔧 Inicializar Git - Se o Git não está configurado</li>
            </ul>
          </li>

          <li>
            <strong>Step 4: Repositório GitHub</strong>
            <p>Aqui você conecta ou cria um repositório no GitHub. Há duas abas:</p>
            
            <div class="tutorial-comparison">
              <div class="tutorial-comparison-item">
                <div class="tutorial-comparison-title">🆕 Criar Novo</div>
                <div class="tutorial-comparison-text">
                  <ul>
                    <li>Digite um nome para o repositório</li>
                    <li>Escolha se será público ou privado</li>
                    <li>Clique em "🚀 Criar e Conectar Repositório"</li>
                  </ul>
                </div>
              </div>
              <div class="tutorial-comparison-item">
                <div class="tutorial-comparison-title">🔗 Conectar Existente</div>
                <div class="tutorial-comparison-text">
                  <ul>
                    <li>Veja a lista dos seus repositórios</li>
                    <li>Clique em um para selecionar</li>
                    <li>Clique em "🔗 Conectar Repositório"</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Excluir Repositórios</div>
                <div class="tutorial-tip-text">Você pode excluir repositórios clicando no botão 🗑️ ao lado de cada um. O sistema pedirá autorização via terminal se necessário.</div>
              </div>
            </div>
          </li>

          <li>
            <strong>Step 5: Preparar Commit</strong>
            <p>Aqui você salva suas alterações no histórico do Git:</p>
            <ul>
              <li>Digite uma mensagem descritiva (ex: "Adiciona página de login")</li>
              <li>Clique em "💾 Fazer Commit"</li>
              <li>O sistema fará automaticamente:
                <ul>
                  <li><code>git add .</code> - Adiciona todos os arquivos</li>
                  <li><code>git commit -m "sua mensagem"</code> - Cria o commit</li>
                </ul>
              </li>
            </ul>
            
            <p><strong>Botões disponíveis:</strong></p>
            <ul>
              <li>💾 Fazer Commit - Salva as alterações</li>
              <li>📊 Ver Alterações - Mostra o <code>git status</code></li>
              <li>⏭️ Pular para Push - Se já commitou tudo</li>
            </ul>

            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Mensagens de Commit</div>
                <div class="tutorial-tip-text">
                  Escreva mensagens claras e descritivas. Exemplos bons:
                  <ul>
                    <li>✅ "Adiciona formulário de login"</li>
                    <li>✅ "Corrige bug no botão de enviar"</li>
                    <li>❌ "mudanças" (muito vago)</li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li>
            <strong>Step 6: Publicar (Push)</strong>
            <p>O último passo! Aqui você envia suas alterações para o GitHub:</p>
            <ul>
              <li>Clique em "⬆️ Fazer Push"</li>
              <li>O sistema executará <code>git push origin main</code></li>
              <li>Suas alterações estarão no GitHub!</li>
            </ul>

            <p><strong>Botões disponíveis:</strong></p>
            <ul>
              <li>⬆️ Fazer Push - Envia para o GitHub</li>
              <li>⬇️ Fazer Pull - Baixa alterações do GitHub</li>
            </ul>

            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Ver no GitHub</div>
                <div class="tutorial-tip-text">Após o push, clique em "Ver no GitHub" para abrir seu repositório no navegador e ver o código publicado!</div>
              </div>
            </div>
          </li>
        </ol>
      </div>

      <div class="tutorial-section">
        <h3>📊 Indicador de Sincronização</h3>
        <p>No header, você verá um indicador que mostra o status de sincronização:</p>
        <ul>
          <li>✅ <strong>Sincronizado</strong> - Tudo commitado e enviado</li>
          <li>📝 <strong>Alterações não commitadas</strong> - Você modificou arquivos</li>
          <li>⬆️ <strong>X commit(s) não enviado(s)</strong> - Precisa fazer push</li>
          <li>⬇️ <strong>X commit(s) no remoto</strong> - Precisa fazer pull</li>
        </ul>
        <p>Clique no indicador para ver detalhes e ações rápidas!</p>
      </div>

      <div class="tutorial-section">
        <h3>🎉 Pronto!</h3>
        <p>Seu projeto agora está no GitHub! A partir de agora, sempre que fizer alterações:</p>
        <ol>
          <li>Modifique os arquivos</li>
          <li>Vá para Step 5 e faça commit</li>
          <li>Vá para Step 6 e faça push</li>
        </ol>
        <p>O indicador de sincronização te avisará quando houver alterações pendentes.</p>
      </div>

      <div class="tutorial-warning">
        <span class="tutorial-warning-icon">⚠️</span>
        <div class="tutorial-warning-content">
          <div class="tutorial-warning-title">Atenção</div>
          <div class="tutorial-warning-text">
            Certifique-se de ter um arquivo .gitignore configurado antes de publicar para não enviar arquivos sensíveis (senhas, chaves de API, etc.) para o GitHub! Use a aba ".gitignore" no menu lateral.
          </div>
        </div>
      </div>
    `
  },

  'daily-workflow': {
    title: '💼 Fluxo de Trabalho Diário',
    content: `
      <div class="tutorial-section">
        <h3>🎯 Objetivo</h3>
        <p>Aprender o fluxo de trabalho diário para fazer alterações e enviá-las para o GitHub usando o Lynx Publisher.</p>
      </div>

      <div class="tutorial-section">
        <h3>🔄 Ciclo Básico de Trabalho</h3>
        <p>Depois que seu projeto já está no GitHub, você seguirá este ciclo simples:</p>
        
        <ol class="tutorial-steps">
          <li>
            <strong>Faça Alterações no Código</strong>
            <p>Edite, adicione ou remova arquivos no seu projeto normalmente usando seu editor favorito.</p>
            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Indicador de Sincronização</div>
                <div class="tutorial-tip-text">Assim que você modificar arquivos, o indicador no header mudará para 📝 "Alterações não commitadas". Clique nele para ver detalhes!</div>
              </div>
            </div>
          </li>

          <li>
            <strong>Veja o Status (Opcional)</strong>
            <p>No Step 5, clique em "📊 Ver Alterações" para ver exatamente quais arquivos foram modificados.</p>
            <p>Você verá a saída do <code>git status</code> mostrando:</p>
            <ul>
              <li>Arquivos modificados (modified)</li>
              <li>Arquivos novos (new file)</li>
              <li>Arquivos deletados (deleted)</li>
            </ul>
          </li>

          <li>
            <strong>Faça um Commit</strong>
            <p>Vá para o <strong>Step 5: Preparar Commit</strong>:</p>
            <ul>
              <li>Digite uma mensagem descritiva do que você mudou</li>
              <li>Clique em "💾 Fazer Commit"</li>
              <li>O sistema adiciona TODOS os arquivos automaticamente e cria o commit</li>
            </ul>
            
            <div class="tutorial-tip">
              <span class="tutorial-tip-icon">💡</span>
              <div class="tutorial-tip-content">
                <div class="tutorial-tip-title">Boas Mensagens de Commit</div>
                <div class="tutorial-tip-text">
                  <ul>
                    <li>✅ "Adiciona validação no formulário de login"</li>
                    <li>✅ "Corrige bug no cálculo de preço"</li>
                    <li>✅ "Atualiza estilos do header"</li>
                    <li>❌ "mudanças" (muito vago)</li>
                    <li>❌ "teste" (não descritivo)</li>
                  </ul>
                </div>
              </div>
            </div>
          </li>

          <li>
            <strong>Envie para o GitHub (Push)</strong>
            <p>Vá para o <strong>Step 6: Publicar</strong>:</p>
            <ul>
              <li>Clique em "⬆️ Fazer Push"</li>
              <li>Suas alterações serão enviadas para o GitHub</li>
              <li>O indicador mudará para ✅ "Sincronizado"</li>
            </ul>
          </li>
        </ol>
      </div>

      <div class="tutorial-section">
        <h3>📥 Baixando Alterações (Pull)</h3>
        <p>Se você trabalha em equipe ou em múltiplos computadores, sempre faça um pull antes de começar:</p>
        <ul>
          <li>Vá para o <strong>Step 6: Publicar</strong></li>
          <li>Clique em "⬇️ Fazer Pull"</li>
          <li>Isso baixa as alterações que outras pessoas (ou você em outro computador) fizeram</li>
        </ul>
        
        <div class="tutorial-tip">
          <span class="tutorial-tip-icon">💡</span>
          <div class="tutorial-tip-content">
            <div class="tutorial-tip-title">Indicador Automático</div>
            <div class="tutorial-tip-text">Se houver commits novos no GitHub, o indicador mostrará ⬇️ "X commit(s) no remoto". Clique nele para fazer pull rapidamente!</div>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>🔄 Fluxo Completo Recomendado</h3>
        <ol class="tutorial-steps">
          <li><strong>Pull</strong> - Baixe as últimas alterações (Step 6)</li>
          <li><strong>Trabalhe</strong> - Faça suas modificações no código</li>
          <li><strong>Commit</strong> - Salve com uma mensagem (Step 5)</li>
          <li><strong>Push</strong> - Envie para o GitHub (Step 6)</li>
        </ol>
        
        <p>O Lynx Publisher simplifica o processo! Você não precisa mais usar <code>git add</code> manualmente - tudo é automático.</p>
      </div>

      <div class="tutorial-section">
        <h3>📊 Usando o Indicador de Sincronização</h3>
        <p>O indicador no header é seu melhor amigo! Ele mostra em tempo real:</p>
        
        <div class="tutorial-command-list">
          <div class="tutorial-command-item">
            <div class="tutorial-command-name">✅ Sincronizado</div>
            <div class="tutorial-command-desc">Tudo commitado e enviado. Você está em dia!</div>
          </div>

          <div class="tutorial-command-item">
            <div class="tutorial-command-name">📝 Alterações não commitadas</div>
            <div class="tutorial-command-desc">Você modificou arquivos. Clique para ver quais e ir para o commit.</div>
          </div>

          <div class="tutorial-command-item">
            <div class="tutorial-command-name">⬆️ X commit(s) não enviado(s)</div>
            <div class="tutorial-command-desc">Você fez commits mas não enviou. Clique para fazer push.</div>
          </div>

          <div class="tutorial-command-item">
            <div class="tutorial-command-name">⬇️ X commit(s) no remoto</div>
            <div class="tutorial-command-desc">Há atualizações no GitHub. Clique para fazer pull.</div>
          </div>
        </div>
      </div>

      <div class="tutorial-section">
        <h3>⚡ Atalhos Rápidos</h3>
        <p>Você pode clicar diretamente no indicador de sincronização para:</p>
        <ul>
          <li>Ver a lista completa de alterações</li>
          <li>Ir direto para o Step 5 (Commit)</li>
          <li>Ir direto para o Step 6 (Push)</li>
          <li>Fazer Pull imediatamente</li>
        </ul>
      </div>

      <div class="tutorial-tip">
        <span class="tutorial-tip-icon">💡</span>
        <div class="tutorial-tip-content">
          <div class="tutorial-tip-title">Boas Práticas</div>
          <div class="tutorial-tip-text">
            <ul>
              <li>Faça commits pequenos e frequentes (não espere acumular muitas alterações)</li>
              <li>Escreva mensagens de commit claras e descritivas</li>
              <li>Sempre faça pull antes de começar a trabalhar</li>
              <li>Faça push regularmente (pelo menos uma vez por dia)</li>
              <li>Use o indicador de sincronização para saber quando agir</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="tutorial-warning">
        <span class="tutorial-warning-icon">⚠️</span>
        <div class="tutorial-warning-content">
          <div class="tutorial-warning-title">Atenção aos Conflitos</div>
          <div class="tutorial-warning-text">
            Se você e outra pessoa modificarem o mesmo arquivo, pode haver conflitos ao fazer pull. O Git marcará os conflitos no arquivo e você precisará resolvê-los manualmente antes de fazer commit.
          </div>
        </div>
      </div>
    `
  }
};

window.tutorialContent = tutorialContent;

tutorialContent['branches'] = {
  title: '🌿 Trabalhando com Branches',
  content: `
    <div class="tutorial-section">
      <h3>🎯 O Que São Branches?</h3>
      <p>Branches (ramificações) são como "universos paralelos" do seu código. Você pode criar uma branch para desenvolver uma nova funcionalidade sem afetar o código principal.</p>
      
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Analogia</div>
        <div class="tutorial-concept-text">
          Imagine que você está escrevendo um livro. A branch <strong>main</strong> é o livro publicado. Quando você quer testar um novo capítulo, cria uma branch <strong>novo-capitulo</strong>. Se gostar, você mescla (merge) de volta ao livro principal. Se não gostar, simplesmente descarta a branch.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🌳 Branch Main (Principal)</h3>
      <p>A branch <strong>main</strong> (antigamente chamada de master) é a branch principal do projeto. É aqui que fica o código "oficial" e estável.</p>
      
      <div class="tutorial-warning">
        <span class="tutorial-warning-icon">⚠️</span>
        <div class="tutorial-warning-content">
          <div class="tutorial-warning-title">Importante</div>
          <div class="tutorial-warning-text">
            Nunca trabalhe diretamente na main em projetos profissionais. Sempre crie uma branch para suas alterações.
          </div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔄 Criando e Usando Branches</h3>
      
      <ol class="tutorial-steps">
        <li>
          <strong>Criar uma Nova Branch</strong>
          <p>Na aba "Branches", digite um nome descritivo e clique em "Criar Branch".</p>
          <div class="tutorial-code">git branch feature/login</div>
          <p>Convenções de nomenclatura:</p>
          <ul>
            <li><code>feature/nome</code> - Nova funcionalidade</li>
            <li><code>fix/nome</code> - Correção de bug</li>
            <li><code>hotfix/nome</code> - Correção urgente</li>
            <li><code>refactor/nome</code> - Refatoração</li>
          </ul>
        </li>

        <li>
          <strong>Trocar de Branch</strong>
          <p>Clique em "Trocar" na branch desejada para começar a trabalhar nela.</p>
          <div class="tutorial-code">git checkout feature/login</div>
          <p>Ou criar e trocar ao mesmo tempo:</p>
          <div class="tutorial-code">git checkout -b feature/login</div>
        </li>

        <li>
          <strong>Trabalhe Normalmente</strong>
          <p>Faça suas alterações, commits e pushes normalmente. Tudo ficará isolado nesta branch.</p>
          <div class="tutorial-code">git add .
git commit -m "feat: adiciona formulário de login"
git push origin feature/login</div>
        </li>

        <li>
          <strong>Enviar Branch para o GitHub</strong>
          <p>Clique em "Push" na branch para enviá-la ao GitHub.</p>
          <div class="tutorial-code">git push -u origin feature/login</div>
          <p>O <code>-u</code> configura o tracking automático.</p>
        </li>
      </ol>
    </div>

    <div class="tutorial-section">
      <h3>🔀 Mesclando Branches (Merge)</h3>
      <p>Quando sua funcionalidade está pronta, você mescla a branch de volta à main:</p>
      
      <ol class="tutorial-steps">
        <li>
          <strong>Volte para a Main</strong>
          <div class="tutorial-code">git checkout main</div>
        </li>

        <li>
          <strong>Atualize a Main</strong>
          <div class="tutorial-code">git pull origin main</div>
        </li>

        <li>
          <strong>Mescle a Branch</strong>
          <div class="tutorial-code">git merge feature/login</div>
        </li>

        <li>
          <strong>Envie para o GitHub</strong>
          <div class="tutorial-code">git push origin main</div>
        </li>
      </ol>

      <div class="tutorial-tip">
        <span class="tutorial-tip-icon">💡</span>
        <div class="tutorial-tip-content">
          <div class="tutorial-tip-title">Pull Request (PR)</div>
          <div class="tutorial-tip-text">
            Em projetos profissionais, ao invés de fazer merge direto, você cria um Pull Request no GitHub. Isso permite que outros revisem seu código antes de mesclar.
          </div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>⚠️ Conflitos de Merge</h3>
      <p>Conflitos acontecem quando duas branches modificam a mesma linha de código. O Git não sabe qual versão manter.</p>
      
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Como Resolver</div>
        <div class="tutorial-concept-text">
          <ol>
            <li>O Git marca os conflitos no arquivo com <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> e <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code></li>
            <li>Abra o arquivo e escolha qual versão manter (ou combine ambas)</li>
            <li>Remova os marcadores de conflito</li>
            <li>Faça <code>git add</code> e <code>git commit</code></li>
          </ol>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🗑️ Deletando Branches</h3>
      <p>Depois de mesclar, você pode deletar a branch:</p>
      <div class="tutorial-code">git branch -d feature/login</div>
      <p>Para deletar no GitHub também:</p>
      <div class="tutorial-code">git push origin --delete feature/login</div>
    </div>
  `
};

tutorialContent['gitignore'] = {
  title: '🚫 Ignorando Arquivos com .gitignore',
  content: `
    <div class="tutorial-section">
      <h3>🎯 O Que é .gitignore?</h3>
      <p>O arquivo <code>.gitignore</code> diz ao Git quais arquivos ou pastas ele deve ignorar. Isso é essencial para não enviar arquivos desnecessários ou sensíveis para o GitHub.</p>
    </div>

    <div class="tutorial-section">
      <h3>🚨 Por Que Usar?</h3>
      <ul>
        <li><strong>Segurança:</strong> Não enviar senhas, chaves de API, tokens</li>
        <li><strong>Tamanho:</strong> Não enviar arquivos grandes ou temporários</li>
        <li><strong>Limpeza:</strong> Manter o repositório organizado</li>
        <li><strong>Performance:</strong> Evitar arquivos gerados automaticamente</li>
      </ul>
    </div>

    <div class="tutorial-section">
      <h3>📝 Arquivos Comuns para Ignorar</h3>
      
      <h4>🔐 Arquivos Sensíveis</h4>
      <div class="tutorial-code">.env
.env.local
config/secrets.yml
*.key
*.pem
credentials.json</div>

      <h4>📦 Dependências</h4>
      <div class="tutorial-code">node_modules/
vendor/
packages/
.pnp/</div>

      <h4>🏗️ Arquivos de Build</h4>
      <div class="tutorial-code">dist/
build/
out/
*.exe
*.dll
*.so</div>

      <h4>💻 Arquivos do Sistema</h4>
      <div class="tutorial-code">.DS_Store
Thumbs.db
desktop.ini
*.swp
*.swo</div>

      <h4>🔧 IDEs e Editores</h4>
      <div class="tutorial-code">.vscode/
.idea/
*.sublime-project
*.sublime-workspace</div>

      <h4>📊 Logs e Temporários</h4>
      <div class="tutorial-code">*.log
logs/
tmp/
temp/
*.tmp</div>
    </div>

    <div class="tutorial-section">
      <h3>✍️ Sintaxe do .gitignore</h3>
      
      <div class="tutorial-command-list">
        <div class="tutorial-command-item">
          <div class="tutorial-command-name">arquivo.txt</div>
          <div class="tutorial-command-desc">Ignora um arquivo específico</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">*.log</div>
          <div class="tutorial-command-desc">Ignora todos os arquivos .log</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">pasta/</div>
          <div class="tutorial-command-desc">Ignora uma pasta inteira</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">!importante.log</div>
          <div class="tutorial-command-desc">Exceção: NÃO ignora este arquivo</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">docs/*.txt</div>
          <div class="tutorial-command-desc">Ignora .txt apenas na pasta docs</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">docs/**/*.txt</div>
          <div class="tutorial-command-desc">Ignora .txt em docs e subpastas</div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🛠️ Como Usar no Lynx Publisher</h3>
      <ol class="tutorial-steps">
        <li>
          <strong>Vá para a aba .gitignore</strong>
          <p>O editor mostrará o conteúdo atual do arquivo.</p>
        </li>

        <li>
          <strong>Adicione Padrões Comuns</strong>
          <p>Clique em "Adicionar Padrões Comuns" para inserir automaticamente os padrões mais usados.</p>
        </li>

        <li>
          <strong>Personalize</strong>
          <p>Adicione ou remova linhas conforme necessário para seu projeto.</p>
        </li>

        <li>
          <strong>Salve</strong>
          <p>Clique em "Salvar" e faça commit das alterações.</p>
        </li>
      </ol>
    </div>

    <div class="tutorial-warning">
      <span class="tutorial-warning-icon">⚠️</span>
      <div class="tutorial-warning-content">
        <div class="tutorial-warning-title">Atenção</div>
        <div class="tutorial-warning-text">
          Se você já fez commit de um arquivo antes de adicioná-lo ao .gitignore, ele continuará no histórico. Use <code>git rm --cached arquivo</code> para removê-lo.
        </div>
      </div>
    </div>

    <div class="tutorial-tip">
      <span class="tutorial-tip-icon">💡</span>
      <div class="tutorial-tip-content">
        <div class="tutorial-tip-title">Dica</div>
        <div class="tutorial-tip-text">
          Visite <a href="https://gitignore.io" target="_blank" style="color: var(--primary)">gitignore.io</a> para gerar .gitignore personalizados para sua stack de tecnologia.
        </div>
      </div>
    </div>
  `
};


tutorialContent['concepts'] = {
  title: '📖 Conceitos Fundamentais do Git',
  content: `
    <div class="tutorial-section">
      <h3>🎯 O Que é Git?</h3>
      <p>Git é um sistema de controle de versão distribuído. Ele permite que você:</p>
      <ul>
        <li>Salve "fotos" (commits) do seu código ao longo do tempo</li>
        <li>Volte para versões anteriores se algo der errado</li>
        <li>Trabalhe em equipe sem conflitos</li>
        <li>Experimente novas ideias sem medo (branches)</li>
      </ul>
    </div>

    <div class="tutorial-section">
      <h3>🌐 Git vs GitHub</h3>
      <div class="tutorial-comparison">
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">Git</div>
          <div class="tutorial-comparison-text">
            <ul>
              <li>Software instalado no seu computador</li>
              <li>Funciona offline</li>
              <li>Gerencia o histórico local</li>
              <li>Gratuito e open source</li>
            </ul>
          </div>
        </div>
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">GitHub</div>
          <div class="tutorial-comparison-text">
            <ul>
              <li>Serviço online (site)</li>
              <li>Armazena repositórios na nuvem</li>
              <li>Facilita colaboração</li>
              <li>Adiciona recursos (Issues, PRs, Actions)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>📦 Repositório (Repository)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Um repositório é uma pasta que contém seu projeto e todo o histórico de alterações. A pasta <code>.git</code> guarda todas as informações do Git.
        </div>
      </div>
      <p>Tipos de repositório:</p>
      <ul>
        <li><strong>Local:</strong> No seu computador</li>
        <li><strong>Remoto:</strong> No GitHub (ou outro serviço)</li>
      </ul>
    </div>

    <div class="tutorial-section">
      <h3>📸 Commit</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Um commit é como uma "foto" do seu código em um momento específico. Cada commit tem:
          <ul>
            <li>Um identificador único (hash SHA)</li>
            <li>Uma mensagem descritiva</li>
            <li>Autor e data</li>
            <li>As alterações feitas</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🎭 Staging Area (Área de Preparação)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          É uma área intermediária onde você prepara os arquivos antes de fazer commit. Você escolhe exatamente o que vai no próximo commit.
        </div>
      </div>
      <p>Fluxo:</p>
      <div class="tutorial-code">Working Directory → Staging Area → Repository
(arquivos modificados) → (git add) → (git commit)</div>
    </div>

    <div class="tutorial-section">
      <h3>🌿 Branch (Ramificação)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Uma branch é uma linha independente de desenvolvimento. Permite trabalhar em funcionalidades isoladas sem afetar o código principal.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔀 Merge (Mesclar)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Merge é o processo de combinar alterações de uma branch em outra. Geralmente, você mescla uma branch de funcionalidade de volta à main.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔗 Remote (Remoto)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Um remote é uma versão do seu repositório hospedada em outro lugar (geralmente GitHub). O nome padrão é <code>origin</code>.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>⬆️ Push (Enviar)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Push envia seus commits locais para o repositório remoto (GitHub). Torna suas alterações visíveis para outros.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>⬇️ Pull (Baixar)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Pull baixa commits do repositório remoto e mescla com seu código local. É como fazer <code>git fetch</code> + <code>git merge</code>.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>📋 Clone</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Clone cria uma cópia completa de um repositório remoto no seu computador, incluindo todo o histórico.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🏷️ Tag</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Tags são marcadores para commits específicos, geralmente usados para marcar versões (v1.0.0, v2.0.0, etc.).
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>💾 Stash (Guardar)</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          Stash guarda temporariamente alterações não commitadas, permitindo que você troque de branch sem perder o trabalho.
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔄 HEAD</h3>
      <div class="tutorial-concept">
        <div class="tutorial-concept-title">Definição</div>
        <div class="tutorial-concept-text">
          HEAD é um ponteiro que indica em qual commit você está atualmente. Geralmente aponta para o último commit da branch atual.
        </div>
      </div>
    </div>
  `
};

tutorialContent['commands'] = {
  title: '⌨️ Comandos Git Essenciais',
  content: `
    <div class="tutorial-section">
      <h3>🎯 Comandos Básicos</h3>
      
      <div class="tutorial-command-list">
        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git init</div>
          <div class="tutorial-command-desc">Inicializa um novo repositório Git na pasta atual.</div>
          <div class="tutorial-command-example">$ git init</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git status</div>
          <div class="tutorial-command-desc">Mostra o estado atual do repositório (arquivos modificados, adicionados, etc.).</div>
          <div class="tutorial-command-example">$ git status</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git add</div>
          <div class="tutorial-command-desc">Adiciona arquivos à staging area.</div>
          <div class="tutorial-command-example">$ git add arquivo.txt
$ git add .                 # Adiciona todos os arquivos
$ git add src/              # Adiciona uma pasta</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git commit</div>
          <div class="tutorial-command-desc">Cria um commit com os arquivos da staging area.</div>
          <div class="tutorial-command-example">$ git commit -m "mensagem do commit"
$ git commit -am "mensagem"  # Add + commit (apenas arquivos já rastreados)</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git log</div>
          <div class="tutorial-command-desc">Mostra o histórico de commits.</div>
          <div class="tutorial-command-example">$ git log
$ git log --oneline         # Versão compacta
$ git log --graph           # Com gráfico de branches</div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🌐 Comandos Remotos</h3>
      
      <div class="tutorial-command-list">
        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git remote add origin [url]</div>
          <div class="tutorial-command-desc">Conecta seu repositório local a um remoto.</div>
          <div class="tutorial-command-example">$ git remote add origin https://github.com/user/repo.git</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git push</div>
          <div class="tutorial-command-desc">Envia commits para o repositório remoto.</div>
          <div class="tutorial-command-example">$ git push
$ git push origin main      # Especifica branch
$ git push -u origin main   # Define upstream (primeira vez)
$ git push --force          # Force push (cuidado!)</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git pull</div>
          <div class="tutorial-command-desc">Baixa e mescla alterações do remoto.</div>
          <div class="tutorial-command-example">$ git pull
$ git pull origin main      # Especifica branch</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git clone [url]</div>
          <div class="tutorial-command-desc">Clona um repositório remoto.</div>
          <div class="tutorial-command-example">$ git clone https://github.com/user/repo.git</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git fetch</div>
          <div class="tutorial-command-desc">Baixa alterações do remoto sem mesclar.</div>
          <div class="tutorial-command-example">$ git fetch origin</div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🌿 Comandos de Branch</h3>
      
      <div class="tutorial-command-list">
        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git branch</div>
          <div class="tutorial-command-desc">Lista, cria ou deleta branches.</div>
          <div class="tutorial-command-example">$ git branch                    # Lista branches
$ git branch nova-branch        # Cria branch
$ git branch -d nome-branch     # Deleta branch
$ git branch -D nome-branch     # Force delete</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git checkout</div>
          <div class="tutorial-command-desc">Troca de branch ou restaura arquivos.</div>
          <div class="tutorial-command-example">$ git checkout main
$ git checkout -b nova-branch   # Cria e troca
$ git checkout arquivo.txt      # Restaura arquivo</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git switch</div>
          <div class="tutorial-command-desc">Comando moderno para trocar de branch.</div>
          <div class="tutorial-command-example">$ git switch main
$ git switch -c nova-branch     # Cria e troca</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git merge</div>
          <div class="tutorial-command-desc">Mescla uma branch na branch atual.</div>
          <div class="tutorial-command-example">$ git merge feature-branch</div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔧 Comandos Avançados</h3>
      
      <div class="tutorial-command-list">
        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git stash</div>
          <div class="tutorial-command-desc">Guarda alterações temporariamente.</div>
          <div class="tutorial-command-example">$ git stash
$ git stash pop             # Recupera alterações
$ git stash list            # Lista stashes
$ git stash drop            # Remove stash</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git reset</div>
          <div class="tutorial-command-desc">Desfaz commits ou alterações.</div>
          <div class="tutorial-command-example">$ git reset HEAD~1          # Desfaz último commit (mantém arquivos)
$ git reset --soft HEAD~1   # Desfaz commit (mantém staging)
$ git reset --hard HEAD~1   # Desfaz tudo (cuidado!)</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git revert</div>
          <div class="tutorial-command-desc">Cria um novo commit que desfaz um commit anterior.</div>
          <div class="tutorial-command-example">$ git revert abc123</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git diff</div>
          <div class="tutorial-command-desc">Mostra diferenças entre commits, branches ou arquivos.</div>
          <div class="tutorial-command-example">$ git diff
$ git diff --staged         # Diferenças na staging area
$ git diff branch1 branch2  # Entre branches</div>
        </div>

        <div class="tutorial-command-item">
          <div class="tutorial-command-name">git tag</div>
          <div class="tutorial-command-desc">Cria tags para marcar versões.</div>
          <div class="tutorial-command-example">$ git tag v1.0.0
$ git tag -a v1.0.0 -m "Versão 1.0"
$ git push origin v1.0.0    # Envia tag</div>
        </div>
      </div>
    </div>

    <div class="tutorial-section">
      <h3>🔍 Diferenças Entre Comandos Similares</h3>
      
      <h4>git push vs git push origin main</h4>
      <div class="tutorial-comparison">
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git push</div>
          <div class="tutorial-comparison-text">
            Envia para o remote e branch configurados como upstream. Funciona após <code>git push -u origin main</code>.
          </div>
        </div>
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git push origin main</div>
          <div class="tutorial-comparison-text">
            Especifica explicitamente o remote (origin) e a branch (main). Sempre funciona.
          </div>
        </div>
      </div>

      <h4>git pull vs git fetch</h4>
      <div class="tutorial-comparison">
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git pull</div>
          <div class="tutorial-comparison-text">
            Baixa E mescla automaticamente. É como <code>git fetch + git merge</code>.
          </div>
        </div>
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git fetch</div>
          <div class="tutorial-comparison-text">
            Apenas baixa as alterações, sem mesclar. Você decide quando fazer merge.
          </div>
        </div>
      </div>

      <h4>git checkout vs git switch</h4>
      <div class="tutorial-comparison">
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git checkout</div>
          <div class="tutorial-comparison-text">
            Comando antigo e versátil. Troca branches E restaura arquivos. Pode confundir.
          </div>
        </div>
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git switch</div>
          <div class="tutorial-comparison-text">
            Comando novo (Git 2.23+). Apenas para trocar branches. Mais claro e seguro.
          </div>
        </div>
      </div>

      <h4>git reset vs git revert</h4>
      <div class="tutorial-comparison">
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git reset</div>
          <div class="tutorial-comparison-text">
            Reescreve o histórico. Perigoso em branches compartilhadas. Use apenas localmente.
          </div>
        </div>
        <div class="tutorial-comparison-item">
          <div class="tutorial-comparison-title">git revert</div>
          <div class="tutorial-comparison-text">
            Cria novo commit que desfaz outro. Seguro para branches compartilhadas. Mantém histórico.
          </div>
        </div>
      </div>
    </div>

    <div class="tutorial-warning">
      <span class="tutorial-warning-icon">⚠️</span>
      <div class="tutorial-warning-content">
        <div class="tutorial-warning-title">Comandos Perigosos</div>
        <div class="tutorial-warning-text">
          <ul>
            <li><code>git reset --hard</code> - Perde alterações permanentemente</li>
            <li><code>git push --force</code> - Pode sobrescrever trabalho de outros</li>
            <li><code>git clean -fd</code> - Deleta arquivos não rastreados</li>
          </ul>
          Use com extremo cuidado!
        </div>
      </div>
    </div>
  `
};


window.tutorialContent = tutorialContent;
