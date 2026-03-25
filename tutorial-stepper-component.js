class TutorialStepper {
  constructor(containerId, tutorialId) {
    this.container = document.getElementById(containerId);
    this.tutorialId = tutorialId;
    this.currentStepIndex = 0;
    this.tutorial = null;
    this.stepStates = {};
    
    this.init();
  }
  
  init() {
    if (!window.tutorialSteps || !window.tutorialSteps[this.tutorialId]) {
      this.showError('Tutorial não encontrado');
      return;
    }
    
    this.tutorial = window.tutorialSteps[this.tutorialId];
    this.initializeStepStates();
    this.render();
    this.attachEventListeners();
  }
  
  initializeStepStates() {
    this.tutorial.steps.forEach((step, index) => {
      this.stepStates[step.id] = {
        completed: false,
        active: index === 0,
        checklist: {}
      };
      
      step.checklist.forEach(item => {
        this.stepStates[step.id].checklist[item.id] = item.status;
      });
    });
  }
  
  render() {
    if (!this.tutorial) return;
    
    const html = `
      <div class="tutorial-stepper">
        <div class="tutorial-stepper-header">
          <h2 class="tutorial-stepper-title">${this.tutorial.title}</h2>
          <p class="tutorial-stepper-description">${this.tutorial.description}</p>
        </div>
        
        ${this.tutorial.steps.map((step, index) => this.renderStep(step, index)).join('')}
      </div>
    `;
    
    this.container.innerHTML = html;
  }
  
  renderStep(step, index) {
    const state = this.stepStates[step.id];
    const isActive = state.active;
    const isCompleted = state.completed;
    const stepClass = `stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    
    return `
      <div class="${stepClass}" data-step-id="${step.id}">
        <!-- Marker Column -->
        <div class="stepper-marker">
          <div class="stepper-number">${isCompleted ? '' : step.number}</div>
          <div class="stepper-connector"></div>
        </div>
        
        <!-- Content Column -->
        <div class="stepper-content">
          <!-- Header (always visible) -->
          <div class="stepper-header" data-step-id="${step.id}">
            <div class="stepper-header-content">
              <div class="stepper-title">${step.title}</div>
              <div class="stepper-summary">${step.summary}</div>
            </div>
            <div class="stepper-expand-icon">${isActive ? '▲' : '▼'}</div>
          </div>
          
          <!-- Body (visible when active) -->
          <div class="stepper-body">
            <!-- Content -->
            <div class="stepper-body-content">
              ${step.content}
            </div>
            
            <!-- Checklist -->
            ${this.renderChecklist(step)}
            
            <!-- Tip -->
            ${this.renderTip(step)}
            
            <!-- CTA -->
            ${this.renderCTA(step)}
            
            <!-- Navigation -->
            ${this.renderNavigation(index)}
          </div>
        </div>
      </div>
    `;
  }
  
  renderChecklist(step) {
    if (!step.checklist || step.checklist.length === 0) return '';
    
    const state = this.stepStates[step.id];
    
    return `
      <div class="stepper-checklist">
        <div class="stepper-checklist-title">Checklist</div>
        <div class="stepper-checklist-items">
          ${step.checklist.map(item => {
            const status = state.checklist[item.id] || item.status;
            const icon = status === 'done' ? '✅' : status === 'failed' ? '❌' : '⏳';
            return `
              <div class="stepper-checklist-item ${status}" data-checklist-id="${item.id}">
                <span class="stepper-checklist-icon">${icon}</span>
                <span class="stepper-checklist-label">${item.label}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
  
  renderTip(step) {
    if (!step.tip) return '';
    
    return `
      <div class="stepper-tip">
        <span class="stepper-tip-icon">💡</span>
        <div class="stepper-tip-text">${step.tip}</div>
      </div>
    `;
  }
  
  renderCTA(step) {
    if (!step.cta) return '';
    
    return `
      <div class="stepper-cta">
        <button class="stepper-cta-button" data-action="${step.cta.action}">
          ${step.cta.label}
        </button>
        <div class="stepper-cta-why">Por quê? ${step.cta.why}</div>
      </div>
    `;
  }
  
  renderNavigation(index) {
    const isFirst = index === 0;
    const isLast = index === this.tutorial.steps.length - 1;
    
    return `
      <div class="stepper-navigation">
        <button 
          class="stepper-nav-button" 
          data-nav="prev" 
          ${isFirst ? 'disabled' : ''}
        >
          ← Anterior
        </button>
        <button 
          class="stepper-nav-button primary" 
          data-nav="next"
        >
          ${isLast ? 'Concluir' : 'Próximo →'}
        </button>
      </div>
    `;
  }
  
  attachEventListeners() {
    this.container.querySelectorAll('.stepper-header').forEach(header => {
      header.addEventListener('click', (e) => {
        const stepId = e.currentTarget.dataset.stepId;
        this.toggleStep(stepId);
      });
    });
    
    this.container.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const direction = e.currentTarget.dataset.nav;
        if (direction === 'next') {
          this.nextStep();
        } else {
          this.prevStep();
        }
      });
    });
    
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        this.handleAction(action);
      });
    });
  }
  
  toggleStep(stepId) {
    const stepIndex = this.tutorial.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    Object.keys(this.stepStates).forEach(id => {
      this.stepStates[id].active = false;
    });
    
    this.stepStates[stepId].active = true;
    this.currentStepIndex = stepIndex;
    
    this.render();
    this.attachEventListeners();
    
    const stepElement = this.container.querySelector(`[data-step-id="${stepId}"]`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  nextStep() {
    if (this.currentStepIndex >= this.tutorial.steps.length - 1) {
      this.completeTutorial();
      return;
    }
    
    const currentStep = this.tutorial.steps[this.currentStepIndex];
    this.stepStates[currentStep.id].completed = true;
    this.stepStates[currentStep.id].active = false;
    
    this.currentStepIndex++;
    const nextStep = this.tutorial.steps[this.currentStepIndex];
    this.stepStates[nextStep.id].active = true;
    
    this.render();
    this.attachEventListeners();
    
    setTimeout(() => {
      const stepElement = this.container.querySelector(`[data-step-id="${nextStep.id}"]`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  prevStep() {
    if (this.currentStepIndex <= 0) return;
    
    const currentStep = this.tutorial.steps[this.currentStepIndex];
    this.stepStates[currentStep.id].active = false;
    
    this.currentStepIndex--;
    const prevStep = this.tutorial.steps[this.currentStepIndex];
    this.stepStates[prevStep.id].active = true;
    this.stepStates[prevStep.id].completed = false;
    
    this.render();
    this.attachEventListeners();
    
    setTimeout(() => {
      const stepElement = this.container.querySelector(`[data-step-id="${prevStep.id}"]`);
      if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  completeTutorial() {
    const lastStep = this.tutorial.steps[this.currentStepIndex];
    this.stepStates[lastStep.id].completed = true;
    
    this.render();
    this.attachEventListeners();
    
    setTimeout(() => {
      alert('🎉 Parabéns! Você completou o tutorial!');
    }, 300);
  }
  
  handleAction(action) {
    console.log('Action triggered:', action);
    
    const actions = {
      openLogin: () => {
        document.getElementById('loginBtn')?.click();
        this.updateChecklistItem('logged-in', 'done');
      },
      selectProject: () => {
        document.getElementById('selectFolderBtn')?.click();
      },
      configureRepo: () => {
        document.querySelector('[data-section="publish"]')?.click();
      },
      publishProject: () => {
        document.getElementById('publishBtn')?.click();
      },
      openGitHub: () => {
        if (currentProject?.remoteInfo?.fullName) {
          const url = `https://github.com/${currentProject.remoteInfo.fullName}`;
          window.open(url, '_blank');
        }
      },
      gitPull: () => {
        document.querySelector('[data-section="git"]')?.click();
        document.getElementById('gitPullBtn')?.click();
      },
      gitStatus: () => {
        document.querySelector('[data-section="git"]')?.click();
        document.getElementById('gitStatusBtn')?.click();
      },
      gitAdd: () => {
        document.querySelector('[data-section="git"]')?.click();
        document.getElementById('gitAddBtn')?.click();
      },
      gitCommit: () => {
        document.querySelector('[data-section="git"]')?.click();
        document.getElementById('gitCommitBtn')?.click();
      },
      gitPush: () => {
        document.querySelector('[data-section="git"]')?.click();
        document.getElementById('gitPushBtn')?.click();
      },
      goToGit: () => {
        document.querySelector('[data-section="git"]')?.click();
      },
      refreshBranches: () => {
        document.querySelector('[data-section="branches"]')?.click();
        document.getElementById('refreshBranchesBtn')?.click();
      },
      createBranch: () => {
        document.querySelector('[data-section="branches"]')?.click();
        document.getElementById('newBranchName')?.focus();
      },
      switchBranch: () => {
        document.querySelector('[data-section="branches"]')?.click();
      },
      pushBranch: () => {
        document.querySelector('[data-section="branches"]')?.click();
      },
      viewGitignore: () => {
        document.querySelector('[data-section="gitignore"]')?.click();
      },
      addCommonPatterns: () => {
        document.querySelector('[data-section="gitignore"]')?.click();
        document.getElementById('addCommonBtn')?.click();
      },
      editGitignore: () => {
        document.querySelector('[data-section="gitignore"]')?.click();
        document.getElementById('gitignoreContent')?.focus();
      },
      saveGitignore: () => {
        document.querySelector('[data-section="gitignore"]')?.click();
        document.getElementById('saveGitignoreBtn')?.click();
      }
    };
    
    if (actions[action]) {
      actions[action]();
    }
  }
  
  updateChecklistItem(itemId, status) {
    const currentStep = this.tutorial.steps[this.currentStepIndex];
    if (this.stepStates[currentStep.id].checklist[itemId] !== undefined) {
      this.stepStates[currentStep.id].checklist[itemId] = status;
      this.render();
      this.attachEventListeners();
    }
  }
  
  showError(message) {
    this.container.innerHTML = `
      <div class="stepper-loading">
        <p>${message}</p>
      </div>
    `;
  }
}

window.TutorialStepper = TutorialStepper;
