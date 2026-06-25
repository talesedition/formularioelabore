/* ========================================
   ELABORE - FORMULARIO ORGANICO
   Script de navegacao por steps
   Uma pergunta por vez com barra de progresso
   ======================================== */

(function() {
    'use strict';

    // ========================================
    // CONFIGURACAO
    // ========================================
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwX2l3waQQf82VKiTVQ9AO7_ePqr_B86UIp6xdiQD4kJlxnYeNnLlnBRFfgamDRRHSu/exec';
    const TOTAL_STEPS = 12; // 12 perguntas, step 13 e a tela final
    const VIDEO_URL = 'https://www.youtube.com/watch?v=SEU_VIDEO_AQUI';

    // ========================================
    // ESTADO
    // ========================================
    let currentStep = 1;
    let formData = {};
    let isAnimating = false;

    // ========================================
    // ELEMENTOS DOM
    // ========================================
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnSubmit = document.getElementById('btnSubmit');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const formNav = document.getElementById('formNav');

    // ========================================
    // INICIALIZACAO
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        initProgress();
        initNavigation();
        initPhoneMask();
        initKeyboardNav();
        initOptionCards();
        updateUI();
    });

    // ========================================
    // PROGRESS BAR
    // ========================================
    function initProgress() {
        updateProgress();
    }

    function updateProgress() {
        const percentage = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
        progressFill.style.width = percentage + '%';
        if (currentStep <= TOTAL_STEPS) {
            progressText.textContent = 'Pergunta ' + currentStep + ' de ' + TOTAL_STEPS;
        } else {
            progressText.textContent = 'Concluido!';
            progressFill.style.width = '100%';
        }
    }

    // ========================================
    // NAVEGACAO
    // ========================================
    function initNavigation() {
        btnPrev.addEventListener('click', prevStep);
        btnNext.addEventListener('click', nextStep);
        btnSubmit.addEventListener('click', submitForm);
    }

    // ========================================
    // VALIDACAO DE CADA STEP
    // ========================================
    function validateStep(stepNum) {
        const step = document.querySelector('.step[data-step="' + stepNum + '"]');
        if (!step) return false;

        const hint = step.querySelector('.step-hint');
        let isValid = true;
        let errorMsg = '';

        // Step 1: Nome completo (text)
        if (stepNum === 1) {
            const input = step.querySelector('input[name="nome_completo"]');
            const value = input.value.trim();
            if (!value || value.length < 3) {
                isValid = false;
                errorMsg = 'Digite seu nome completo (minimo 3 caracteres)';
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        }

        // Step 2: Instagram (text)
        else if (stepNum === 2) {
            const input = step.querySelector('input[name="instagram"]');
            const value = input.value.trim();
            if (!value || value.length < 2) {
                isValid = false;
                errorMsg = 'Informe o @ do Instagram da sua empresa';
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        }

        // Step 3: WhatsApp (tel)
        else if (stepNum === 3) {
            const input = step.querySelector('input[name="whatsapp"]');
            const value = input.value.replace(/\D/g, '');
            if (value.length < 10) {
                isValid = false;
                errorMsg = 'Digite um numero de WhatsApp valido com DDD';
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        }

        // Steps 4 a 9: Checkbox (multipla escolha)
        else if (stepNum >= 4 && stepNum <= 9) {
            const checkboxes = step.querySelectorAll('input[type="checkbox"]:checked');
            if (checkboxes.length === 0) {
                isValid = false;
                errorMsg = 'Selecione uma ou mais opcoes';
            }
        }

        // Steps 10 a 12: Radio (escolha unica)
        else if (stepNum >= 10 && stepNum <= 12) {
            const selected = step.querySelector('input[type="radio"]:checked');
            if (!selected) {
                isValid = false;
                errorMsg = 'Selecione uma opcao para continuar';
            }
        }

        // Atualiza hint
        if (hint) {
            if (!isValid) {
                hint.textContent = errorMsg;
                hint.classList.add('error');
            } else {
                hint.textContent = getDefaultHint(stepNum);
                hint.classList.remove('error');
            }
        }

        return isValid;
    }

    function getDefaultHint(stepNum) {
        const hints = {
            1: 'Preencha seu nome para continuar',
            2: 'Informe o @ do Instagram da sua empresa',
            3: 'Digite com DDD',
            4: 'Selecione uma ou mais opcoes',
            5: 'Selecione uma ou mais opcoes',
            6: 'Selecione uma ou mais opcoes',
            7: 'Selecione uma ou mais opcoes',
            8: 'Selecione uma ou mais opcoes',
            9: 'Selecione uma ou mais opcoes',
            10: 'Selecione uma opcao para continuar',
            11: 'Selecione uma opcao para continuar',
            12: 'Selecione uma opcao para continuar',
            13: 'Obrigado! Aguarde nosso contato.'
        };
        return hints[stepNum] || '';
    }

    // ========================================
    // AVANCAR / VOLTAR
    // ========================================
    window.nextStep = function() {
        if (isAnimating) return;

        if (!validateStep(currentStep)) {
            const currentStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
            if (currentStepEl) {
                currentStepEl.classList.add('shake');
                setTimeout(() => currentStepEl.classList.remove('shake'), 400);
            }
            return;
        }

        // Salva dados do step atual
        saveStepData(currentStep);

        if (currentStep >= TOTAL_STEPS) return;

        isAnimating = true;

        const currentEl = document.querySelector('.step[data-step="' + currentStep + '"]');
        const nextEl = document.querySelector('.step[data-step="' + (currentStep + 1) + '"]');

        if (currentEl && nextEl) {
            currentEl.classList.add('slide-out-left');

            setTimeout(() => {
                currentEl.classList.remove('active', 'slide-out-left');
                nextEl.classList.add('active', 'slide-in-right');

                currentStep++;
                updateProgress();
                updateUI();

                setTimeout(() => {
                    nextEl.classList.remove('slide-in-right');
                    isAnimating = false;

                    // Focus no primeiro input do novo step
                    const firstInput = nextEl.querySelector('input, select, textarea');
                    if (firstInput && currentStep !== 13) {
                        setTimeout(() => firstInput.focus(), 300);
                    }
                }, 500);
            }, 400);
        }
    };

    window.prevStep = function() {
        if (isAnimating || currentStep <= 1) return;

        isAnimating = true;

        const currentEl = document.querySelector('.step[data-step="' + currentStep + '"]');
        const prevEl = document.querySelector('.step[data-step="' + (currentStep - 1) + '"]');

        if (currentEl && prevEl) {
            currentEl.style.transform = 'translateX(40px)';
            currentEl.style.opacity = '0';

            setTimeout(() => {
                currentEl.classList.remove('active');
                currentEl.style.transform = '';
                currentEl.style.opacity = '';

                prevEl.classList.add('active', 'slide-in-left');

                currentStep--;
                updateProgress();
                updateUI();

                setTimeout(() => {
                    prevEl.classList.remove('slide-in-left');
                    isAnimating = false;
                }, 500);
            }, 400);
        }
    };

    // ========================================
    // ATUALIZAR UI (botoes, visibilidade)
    // ========================================
    function updateUI() {
        // Botao anterior
        if (currentStep === 1) {
            btnPrev.classList.add('hidden');
        } else {
            btnPrev.classList.remove('hidden');
        }

        // Botao proximo / enviar
        if (currentStep === 12) {
            // Ultima pergunta: mostra botao Enviar
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'inline-flex';
        } else if (currentStep === 13) {
            // Tela final: esconde navegacao
            formNav.style.display = 'none';
            progressText.textContent = 'Concluido!';
            progressFill.style.width = '100%';
        } else {
            btnNext.style.display = 'inline-flex';
            btnSubmit.style.display = 'none';
        }

        // Atualiza texto do botao next no penultimo step
        if (currentStep === 11) {
            btnNext.innerHTML = 'Quase la <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
        } else {
            btnNext.innerHTML = 'Continuar <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
        }
    }

    // ========================================
    // SALVAR DADOS DO STEP
    // ========================================
    function saveStepData(stepNum) {
        const step = document.querySelector('.step[data-step="' + stepNum + '"]');
        if (!step) return;

        const inputs = step.querySelectorAll('input[name], select[name], textarea[name]');
        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                // Para checkboxes, acumula valores em array
                if (!formData[input.name]) formData[input.name] = [];
                if (input.checked) {
                    if (!formData[input.name].includes(input.value)) {
                        formData[input.name].push(input.value);
                    }
                }
            } else {
                formData[input.name] = input.value.trim();
            }
        });
    }

    // ========================================
    // SUBMIT FORM
    // ========================================
    window.submitForm = function() {
        if (isAnimating) return;

        if (!validateStep(currentStep)) {
            const currentStepEl = document.querySelector('.step[data-step="' + currentStep + '"]');
            if (currentStepEl) {
                currentStepEl.classList.add('shake');
                setTimeout(() => currentStepEl.classList.remove('shake'), 400);
            }
            return;
        }

        // Salva dados finais
        saveStepData(currentStep);

        // Prepara dados para envio
        const payload = {
            ...formData,
            source: 'formulario_organico',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Desabilita botao
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Enviando...</span>';

        // Envia para Google Sheets
        sendToGoogleSheets(payload);

        // Avanca para tela de sucesso (step 13)
        isAnimating = true;

        const currentEl = document.querySelector('.step[data-step="' + currentStep + '"]');
        const successEl = document.querySelector('.step[data-step="13"]');

        if (currentEl && successEl) {
            currentEl.classList.add('slide-out-left');

            setTimeout(() => {
                currentEl.classList.remove('active', 'slide-out-left');
                successEl.classList.add('active', 'slide-in-right');

                currentStep = 13;
                updateUI();

                setTimeout(() => {
                    successEl.classList.remove('slide-in-right');
                    isAnimating = false;
                }, 500);
            }, 400);
        }
    };

    // ========================================
    // ENVIAR PARA GOOGLE SHEETS
    // ========================================
    function sendToGoogleSheets(data) {
        if (!GOOGLE_SHEETS_URL) {
            console.log('Modo simulacao - dados:', data);
            return;
        }

        fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            console.log('Sucesso:', result);
        })
        .catch(error => {
            console.error('Erro ao enviar:', error);
        });
    }

    // ========================================
    // MASCARA DE TELEFONE
    // ========================================
    function initPhoneMask() {
        const phoneInput = document.getElementById('whatsapp');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');

            // Limita a 11 digitos
            if (value.length > 11) value = value.slice(0, 11);

            // Aplica mascara
            if (value.length >= 2) {
                value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
            }
            if (value.length >= 10) {
                const parts = value.split(' ');
                if (parts[1] && parts[1].length > 5) {
                    value = parts[0] + ' ' + parts[1].slice(0, 5) + '-' + parts[1].slice(5);
                }
            }

            e.target.value = value;
        });
    }

    // ========================================
    // NAVEGACAO POR TECLADO
    // ========================================
    function initKeyboardNav() {
        document.addEventListener('keydown', function(e) {
            // Enter avanca (exceto em checkboxes e na tela final)
            if (e.key === 'Enter' && currentStep !== 13) {
                const activeEl = document.activeElement;
                // Nao intercepta Enter em textareas
                if (activeEl && activeEl.tagName === 'TEXTAREA') return;
                e.preventDefault();
                if (currentStep === 12) {
                    submitForm();
                } else {
                    nextStep();
                }
            }

            // Escape fecha modal
            if (e.key === 'Escape') {
                closePrivacyModal();
            }
        });
    }

    // ========================================
    // INTERACAO COM OPTION CARDS
    // ========================================
    function initOptionCards() {
        // Permite clicar no card inteiro para selecionar
        document.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Nao propaga se clicou no link de politica
                if (e.target.tagName === 'A') return;

                const input = this.querySelector('input');
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = !input.checked;
                    } else {
                        input.checked = true;
                    }

                    // Dispara change para atualizar estilos
                    input.dispatchEvent(new Event('change'));

                    // Auto-avanca apos 400ms em radio buttons
                    if (input.type === 'radio') {
                        setTimeout(() => {
                            if (currentStep === 12) {
                                submitForm();
                            } else {
                                nextStep();
                            }
                        }, 400);
                    }
                }
            });

            // Suporte a navegacao por teclado
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        // Remove erro ao interagir com input
        document.querySelectorAll('.step input').forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('error');
                const step = this.closest('.step');
                const hint = step.querySelector('.step-hint');
                if (hint) {
                    const stepNum = parseInt(step.dataset.step);
                    hint.textContent = getDefaultHint(stepNum);
                    hint.classList.remove('error');
                }
            });
        });
    }

    // ========================================
    // TOAST
    // ========================================
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    window.showToast = showToast;

    // ========================================
    // MODAL POLITICA DE PRIVACIDADE
    // ========================================
    window.showPrivacyModal = function(e) {
        if (e) e.preventDefault();
        const overlay = document.getElementById('privacyModal');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closePrivacyModal = function() {
        const overlay = document.getElementById('privacyModal');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    // Fecha modal ao clicar fora
    document.addEventListener('click', function(e) {
        const overlay = document.getElementById('privacyModal');
        if (e.target === overlay) {
            closePrivacyModal();
        }
    });

    // ========================================
    // GATE SCREEN FUNCTIONS
    // ========================================
    window.enterForm = function() {
        const gate = document.getElementById('gateScreen');
        const formContainer = document.getElementById('formContainer');

        if (gate && formContainer) {
            gate.style.opacity = '0';
            gate.style.transform = 'scale(0.95)';

            setTimeout(() => {
                gate.style.display = 'none';
                formContainer.style.display = 'flex';

                setTimeout(() => {
                    formContainer.style.opacity = '1';
                    formContainer.style.transform = 'translateY(0)';
                }, 50);
            }, 400);
        }
    };

    window.exitForm = function() {
        window.location.href = 'https://elaboreagencia.com.br/';
    };

    // ========================================
    // PREFERS REDUCED MOTION
    // ========================================
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.step').forEach(step => {
            step.style.transition = 'none';
        });
    }

})();