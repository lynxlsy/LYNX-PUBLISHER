// Guided Stepper Component
// Manages the wizard-style step navigation

class GuidedStepper {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.steps = [];
    this.currentStepIndex = 0;
    this.state = {};
    this.onStepChange = null;
  }

  // Initialize stepper with step definitions
  init(stepDefinitions) {
    this.steps = stepDefinitions.map((def, index) => ({
      ...def,
      index,
      status: index === 0 ? 'active' : 'pending',
      expanded: index === 0,
      data: null
    }));
    
    this.render();
    this.attachEventListeners();
  }

  // Render the entire stepper
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="guided-stepper">
        ${this.steps.map(step => this.renderStep(step)).join('')}
      </div>
    `;
  }

  // Render a single step
  renderStep(step) {
    const statusIcon = this.getStatusIcon(step.status);
    const statusText = this.getStatusText(step.status);
    const isDisabled = step.status === 'pending' && step.index > this.currentStepIndex + 1;
    const isLastStep = step.index === this.steps.length - 1;
    
    return `
      <div class="step ${step.status} ${step.expanded ? 'expanded' : ''} ${isDisabled ? 'disabled' : ''}" 
           data-step-index="${step.index}">
        <div class="step-left">
          <div class="step-circle ${step.status}">
            ${step.status === 'completed' ? '✓' : step.status === 'error' ? '✗' : step.index + 1}
          </div>
          ${!isLastStep ? '<div class="step-line"></div>' : ''}
        </div>
        <div class="step-right">
          <div class="step-header" data-step-header="${step.index}">
            <div class="step-header-content">
              <h3 class="step-title">${step.title}</h3>
              <p class="step-description">${step.description}</p>
            </div>
            <div class="step-meta">
              <span class="step-badge ${step.status}">
                <span class="badge-icon">${statusIcon}</span>
                <span class="badge-text">${statusText}</span>
              </span>
              <button class="step-toggle" aria-label="Toggle step">
                ${step.expanded ? '▲' : '▼'}
              </button>
            </div>
          </div>
          <div class="step-body">
            <div class="step-content" id="step-content-${step.index}">
              ${step.renderContent ? step.renderContent(step.data) : '<p>Carregando...</p>'}
            </div>
            ${this.renderStepActions(step)}
          </div>
        </div>
      </div>
    `;
  }

  // Render step action buttons
  renderStepActions(step) {
    if (step.status === 'pending' && step.index > this.currentStepIndex) {
      return '';
    }
    
    const showBack = step.index > 0;
    const showNext = step.index < this.steps.length - 1;
    const primaryAction = step.primaryAction || 'Avançar';
    
    return `
      <div class="step-actions">
        ${showBack ? `<button class="secondary" data-step-back="${step.index}">← Voltar</button>` : ''}
        ${step.customActions ? step.customActions(step.data) : ''}
        ${showNext ? `<button class="primary" data-step-next="${step.index}">${primaryAction} →</button>` : ''}
      </div>
    `;
  }

  // Get status icon
  getStatusIcon(status) {
    const icons = {
      pending: '⏳',
      active: '▶️',
      completed: '✅',
      error: '❌'
    };
    return icons[status] || '○';
  }

  // Get status text
  getStatusText(status) {
    const texts = {
      pending: 'Pendente',
      active: 'Em andamento',
      completed: 'Concluído',
      error: 'Erro'
    };
    return texts[status] || 'Desconhecido';
  }

  // Attach event listeners
  attachEventListeners() {
    // Step header click (expand/collapse)
    this.container.querySelectorAll('[data-step-header]').forEach(header => {
      header.addEventListener('click', (e) => {
        const stepIndex = parseInt(header.dataset.stepHeader);
        this.toggleStep(stepIndex);
      });
    });

    // Next button
    this.container.querySelectorAll('[data-step-next]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIndex = parseInt(btn.dataset.stepNext);
        this.goToNextStep(stepIndex);
      });
    });

    // Back button
    this.container.querySelectorAll('[data-step-back]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const stepIndex = parseInt(btn.dataset.stepBack);
        this.goToPreviousStep(stepIndex);
      });
    });
  }

  // Toggle step expansion
  toggleStep(stepIndex) {
    const step = this.steps[stepIndex];
    
    // Don't allow opening pending steps that are too far ahead
    if (step.status === 'pending' && stepIndex > this.currentStepIndex + 1) {
      return;
    }
    
    // Collapse all steps
    this.steps.forEach(s => s.expanded = false);
    
    // Expand clicked step
    step.expanded = true;
    this.currentStepIndex = stepIndex;
    
    // Update active status
    this.steps.forEach((s, i) => {
      if (s.status !== 'completed' && s.status !== 'error') {
        s.status = i === stepIndex ? 'active' : 'pending';
      }
    });
    
    this.render();
    this.attachEventListeners();
    
    if (this.onStepChange) {
      this.onStepChange(step);
    }
  }

  // Go to next step
  async goToNextStep(currentIndex) {
    const currentStep = this.steps[currentIndex];
    
    // Validate current step before proceeding
    if (currentStep.validate) {
      const validation = await currentStep.validate(currentStep.data);
      if (!validation.valid) {
        this.showStepError(currentIndex, validation.message);
        return;
      }
    }
    
    // Mark current step as completed
    currentStep.status = 'completed';
    
    // Move to next step
    const nextIndex = currentIndex + 1;
    if (nextIndex < this.steps.length) {
      this.toggleStep(nextIndex);
    }
  }

  // Go to previous step
  goToPreviousStep(currentIndex) {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      this.toggleStep(prevIndex);
    }
  }

  // Update step status
  updateStepStatus(stepIndex, status, data = null) {
    const step = this.steps[stepIndex];
    step.status = status;
    if (data !== null) {
      step.data = data;
    }
    this.render();
    this.attachEventListeners();
  }

  // Update step content
  updateStepContent(stepIndex, content) {
    const contentEl = document.getElementById(`step-content-${stepIndex}`);
    if (contentEl) {
      contentEl.innerHTML = content;
    }
  }

  // Show step error
  showStepError(stepIndex, message) {
    const step = this.steps[stepIndex];
    step.status = 'error';
    
    const errorCard = `
      <div class="step-warning-card">
        <div class="step-warning-icon">⚠️</div>
        <div>
          <div class="step-info-title">Não foi possível avançar</div>
          <div class="step-info-text">${message}</div>
        </div>
      </div>
    `;
    
    const contentEl = document.getElementById(`step-content-${stepIndex}`);
    if (contentEl) {
      contentEl.insertAdjacentHTML('afterbegin', errorCard);
    }
    
    this.render();
    this.attachEventListeners();
  }

  // Get current step
  getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }

  // Get step by index
  getStep(index) {
    return this.steps[index];
  }

  // Get all steps
  getAllSteps() {
    return this.steps;
  }

  // Reset stepper
  reset() {
    this.steps.forEach((step, index) => {
      step.status = index === 0 ? 'active' : 'pending';
      step.expanded = index === 0;
      step.data = null;
    });
    this.currentStepIndex = 0;
    this.render();
    this.attachEventListeners();
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GuidedStepper;
}
