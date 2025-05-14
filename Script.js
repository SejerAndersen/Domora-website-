// Particles.js - Interactive Background System
class ParticleSystem {
    constructor(canvas, options) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseOver = false;
        this.options = Object.assign({
            particleCount: 80,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.2, max: 0.8 },
            connectionDistance: 150,
            connectionWidth: { min: 0.1, max: 1 },
            particleColor: '#2076FF',
            connectionColor: 'rgba(32, 118, 255, 0.15)',
            interactiveDistance: 200,
            interactiveForce: 3
        }, options);

        this.init();
    }

    init() {
        // Set canvas to full window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mouse interaction
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseenter', () => {
            this.isMouseOver = true;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseOver = false;
        });

        // Create particles
        this.createParticles();

        // Start animation loop
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Recreate particles when resizing
        if (this.particles.length > 0) {
            this.particles = [];
            this.createParticles();
        }
    }

    createParticles() {
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min,
                speedX: (Math.random() - 0.5) * (this.options.particleSpeed.max - this.options.particleSpeed.min),
                speedY: (Math.random() - 0.5) * (this.options.particleSpeed.max - this.options.particleSpeed.min),
                originalSpeedX: 0,
                originalSpeedY: 0,
                opacity: Math.random() * 0.5 + 0.3
            });

            // Store original speed for returning to normal after interaction
            this.particles[i].originalSpeedX = this.particles[i].speedX;
            this.particles[i].originalSpeedY = this.particles[i].speedY;
        }
    }

    updateParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            // Apply mouse interaction
            if (this.isMouseOver) {
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.interactiveDistance) {
                    const force = (this.options.interactiveDistance - distance) / this.options.interactiveDistance;
                    const angle = Math.atan2(dy, dx);
                    
                    // Repel particles from mouse
                    particle.speedX = particle.originalSpeedX - Math.cos(angle) * force * this.options.interactiveForce;
                    particle.speedY = particle.originalSpeedY - Math.sin(angle) * force * this.options.interactiveForce;
                } else {
                    // Gradually return to original speed
                    particle.speedX = particle.speedX * 0.95 + particle.originalSpeedX * 0.05;
                    particle.speedY = particle.speedY * 0.95 + particle.originalSpeedY * 0.05;
                }
            } else {
                // Gradually return to original speed
                particle.speedX = particle.speedX * 0.95 + particle.originalSpeedX * 0.05;
                particle.speedY = particle.speedY * 0.95 + particle.originalSpeedY * 0.05;
            }

            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around screen edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        }
    }

    findConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    // Calculate opacity and width based on distance
                    const opacity = 1 - (distance / this.options.connectionDistance);
                    const width = this.options.connectionWidth.min + 
                                  (this.options.connectionWidth.max - this.options.connectionWidth.min) * 
                                  (1 - (distance / this.options.connectionDistance));
                    
                    this.connections.push({
                        p1: p1,
                        p2: p2,
                        opacity: opacity,
                        width: width
                    });
                }
            }
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        for (let i = 0; i < this.connections.length; i++) {
            const connection = this.connections[i];
            const color = this.options.connectionColor;
            
            this.ctx.beginPath();
            this.ctx.moveTo(connection.p1.x, connection.p1.y);
            this.ctx.lineTo(connection.p2.x, connection.p2.y);
            this.ctx.strokeStyle = color.replace(')', `, ${connection.opacity})`).replace('rgba', 'rgba');
            this.ctx.lineWidth = connection.width;
            this.ctx.stroke();
        }
        
        // Draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.options.particleColor.replace(')', `, ${particle.opacity})`).replace('rgb', 'rgba');
            this.ctx.fill();
        }
    }

    animate() {
        this.updateParticles();
        this.findConnections();
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }
}

// Demo Node System for interactive modal
class DemoNodeSystem {
    constructor(container) {
        this.container = container;
        this.centralNode = container.querySelector('.demo-central-node');
        this.dataParticles = container.querySelector('.demo-data-particles');
        this.connectionLines = container.querySelector('.demo-connection-lines');
        this.nodes = container.querySelector('.demo-nodes');
        this.mousePosition = { x: 0, y: 0 };
        this.nodeCount = 12;
        this.nodeElements = [];
        this.particleElements = [];
        this.connectionElements = [];
        
        this.init();
    }
    
    init() {
        // Create interactive elements
        this.createNodes();
        this.createParticles();
        this.createConnections();
        
        // Add mouse interaction
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            
            this.updateSystem();
        });
        
        // Start animation loop
        this.animate();
    }
    
    createNodes() {
        for (let i = 0; i < this.nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'demo-node';
            
            // Position nodes in a circle around the central node
            const angle = (i / this.nodeCount) * Math.PI * 2;
            const distance = 100 + Math.random() * 60;
            const x = Math.cos(angle) * distance + this.container.clientWidth / 2 - 5;
            const y = Math.sin(angle) * distance + this.container.clientHeight / 2 - 5;
            
            node.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #00EEFF;
                box-shadow: 0 0 10px rgba(0, 238, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                transition: transform 0.3s ease;
            `;
            
            this.nodes.appendChild(node);
            this.nodeElements.push({
                element: node,
                x: x,
                y: y,
                angle: angle,
                distance: distance,
                originalX: x,
                originalY: y
            });
        }
    }
    
    createParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'data-particle';
            
            // Random position within the container
            const x = Math.random() * this.container.clientWidth;
            const y = Math.random() * this.container.clientHeight;
            
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background: rgba(32, 118, 255, 0.6);
                left: ${x}px;
                top: ${y}px;
                transition: transform 0.5s ease;
            `;
            
            this.dataParticles.appendChild(particle);
            this.particleElements.push({
                element: particle,
                x: x,
                y: y,
                targetX: x,
                targetY: y,
                speed: 0.5 + Math.random() * 2
            });
        }
    }
    
    createConnections() {
        // Create connections between central node and satellite nodes
        for (let i = 0; i < this.nodeElements.length; i++) {
            const connection = document.createElement('div');
            connection.className = 'node-connection';
            
            connection.style.cssText = `
                position: absolute;
                height: 2px;
                background: linear-gradient(90deg, #2076FF, transparent);
                transform-origin: left center;
                opacity: 0.6;
                left: ${this.container.clientWidth / 2}px;
                top: ${this.container.clientHeight / 2}px;
            `;
            
            this.connectionLines.appendChild(connection);
            this.connectionElements.push({
                element: connection,
                targetNode: this.nodeElements[i]
            });
        }
    }
    
    updateSystem() {
        // Update nodes based on mouse position
        for (let i = 0; i < this.nodeElements.length; i++) {
            const node = this.nodeElements[i];
            
            // Calculate distance from mouse
            const dx = this.mousePosition.x - node.x;
            const dy = this.mousePosition.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Move nodes away from mouse
            if (distance < 100) {
                const force = (100 - distance) / 100 * 30;
                const angle = Math.atan2(dy, dx);
                
                node.x = node.originalX - Math.cos(angle) * force;
                node.y = node.originalY - Math.sin(angle) * force;
            } else {
                // Return to original position
                node.x = node.x * 0.95 + node.originalX * 0.05;
                node.y = node.y * 0.95 + node.originalY * 0.05;
            }
            
            node.element.style.left = `${node.x}px`;
            node.element.style.top = `${node.y}px`;
        }
        
        // Update connections
        for (let i = 0; i < this.connectionElements.length; i++) {
            const connection = this.connectionElements[i];
            const node = connection.targetNode;
            
            // Calculate connection angle and length
            const dx = node.x + 5 - this.container.clientWidth / 2;
            const dy = node.y + 5 - this.container.clientHeight / 2;
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            connection.element.style.width = `${length}px`;
            connection.element.style.transform = `rotate(${angle}deg)`;
        }
        
        // Update data particles
        for (let i = 0; i < this.particleElements.length; i++) {
            const particle = this.particleElements[i];
            
            // Every 3 seconds, set a new target for the particle
            if (Math.random() < 0.01) {
                // 50% chance to target central node, 50% chance to target random satellite node
                if (Math.random() < 0.5) {
                    particle.targetX = this.container.clientWidth / 2;
                    particle.targetY = this.container.clientHeight / 2;
                } else {
                    const randomNode = this.nodeElements[Math.floor(Math.random() * this.nodeElements.length)];
                    particle.targetX = randomNode.x + 5;
                    particle.targetY = randomNode.y + 5;
                }
            }
            
            // Move particle towards target
            const dx = particle.targetX - particle.x;
            const dy = particle.targetY - particle.y;
            particle.x += dx * 0.03;
            particle.y += dy * 0.03;
            
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            
            // Fade in/out based on distance to target
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
                particle.element.style.opacity = (1 - distance / 20) * 0.8;
                
                // If very close to target, set new random target
                if (distance < 5 && Math.random() < 0.1) {
                    particle.targetX = Math.random() * this.container.clientWidth;
                    particle.targetY = Math.random() * this.container.clientHeight;
                }
            } else {
                particle.element.style.opacity = 0.2;
            }
        }
    }
    
    animate() {
        this.updateSystem();
        requestAnimationFrame(() => this.animate());
    }
}
// Main.js - Site initialization and functions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particle system
    const particlesCanvas = document.getElementById('particles-canvas');
    if (particlesCanvas) {
        new ParticleSystem(particlesCanvas);
    }
    
    // Initialize loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                loadingScreen.classList.add('hidden');
            }, 1500);
        });
    }
    
    // Header scroll behavior
    const header = document.querySelector('.header');
    let lastScrollPosition = 0;
    
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.pageYOffset;
        
        if (currentScrollPosition <= 0) {
            header.classList.remove('hidden');
        } else if (currentScrollPosition < lastScrollPosition) {
            header.classList.remove('hidden');
        } else {
            header.classList.add('hidden');
        }
        
        lastScrollPosition = currentScrollPosition;
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
            
            const spans = menuToggle.querySelectorAll('span');
            spans.forEach(function(span) {
                span.classList.toggle('active');
            });
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
                
                const spans = menuToggle.querySelectorAll('span');
                spans.forEach(function(span) {
                    span.classList.remove('active');
                });
            });
        });
    }
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    anchorLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Case studies slider
    const casesSlider = document.querySelector('.cases-slider');
    const caseCards = document.querySelectorAll('.case-card');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const dots = document.querySelectorAll('.dot');
    
    if (casesSlider && caseCards.length > 0) {
        let currentSlide = 0;
        const slideCount = Math.ceil(caseCards.length / (window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1));
        
        function updateSlider() {
            const cardWidth = caseCards[0].offsetWidth + 20; // Including margin
            const transformValue = -currentSlide * cardWidth;
            
            casesSlider.style.transform = `translateX(${transformValue}px)`;
            
            // Update dots
            dots.forEach(function(dot, index) {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        function goToSlide(index) {
            currentSlide = Math.max(0, Math.min(index, slideCount - 1));
            updateSlider();
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', function() {
                goToSlide(currentSlide - 1);
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                goToSlide(currentSlide + 1);
            });
        }
        
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                goToSlide(index);
            });
        });
        
        window.addEventListener('resize', function() {
            goToSlide(0);
        });
    }
    
    // Demo modal
    const demoTrigger = document.getElementById('demo-trigger');
    const demoModal = document.getElementById('demo-modal');
    const modalClose = document.querySelector('.modal-close');
    
    if (demoTrigger && demoModal) {
        demoTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            demoModal.classList.add('open');
            
            // Initialize the demo node system when opening the modal
            const demoContainer = document.querySelector('.interactive-node-container');
            if (demoContainer && !demoContainer.initialized) {
                new DemoNodeSystem(demoContainer);
                demoContainer.initialized = true;
            }
        });
        
        if (modalClose) {
            modalClose.addEventListener('click', function() {
                demoModal.classList.remove('open');if (modalClose) {
            modalClose.addEventListener('click', function() {
                demoModal.classList.remove('open');
            });
        }
        
        // Close modal when clicking outside content
        demoModal.addEventListener('click', function(e) {
            if (e.target === demoModal) {
                demoModal.classList.remove('open');
            }
        });
    }
    
    // Form submission handling
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                nameInput.classList.add('error');
                isValid = false;
            } else {
                nameInput.classList.remove('error');
            }
            
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
                emailInput.classList.add('error');
                isValid = false;
            } else {
                emailInput.classList.remove('error');
            }
            
            if (!messageInput.value.trim()) {
                messageInput.classList.add('error');
                isValid = false;
            } else {
                messageInput.classList.remove('error');
            }
            
            if (isValid) {
                // Normally you would submit the form to your backend
                // For now, we'll just show a success message
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Beskeden er sendt!';
                submitButton.classList.add('success');
                
                setTimeout(function() {
                    submitButton.textContent = 'Send besked';
                    submitButton.classList.remove('success');
                    contactForm.reset();
                }, 3000);
            }
        });
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll('.service-card, .case-card, .process-step, .stat, .about-visual');
    
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
        );
    }
    
    function handleScrollAnimation() {
        animatedElements.forEach(function(element) {
            if (isElementInViewport(element)) {
                element.classList.add('animate-in');
            }
        });
    }
    
    window.addEventListener('scroll', handleScrollAnimation);
    window.addEventListener('resize', handleScrollAnimation);
    
    // Trigger once on page load
    handleScrollAnimation();
});
// Interactive Effects - Custom Cursor and Data Flow Animation
document.addEventListener('DOMContentLoaded', function() {
    // Custom Cursor
    const customCursor = document.createElement('div');
    customCursor.className = 'custom-cursor';
    document.body.appendChild(customCursor);
    
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        // Show cursors when mouse moves
        if (!customCursor.classList.contains('visible')) {
            customCursor.classList.add('visible');
            cursorDot.classList.add('visible');
        }
        
        // Position cursors with slight delay for main cursor
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        setTimeout(function() {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
        }, 50);
    });
    
    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', function() {
        customCursor.classList.remove('visible');
        cursorDot.classList.remove('visible');
    });
    
    // Detect interactive elements for cursor effect
    const interactiveElements = document.querySelectorAll('a, button, .service-card, .satellite-node, .case-card');
    
    interactiveElements.forEach(function(element) {
        element.addEventListener('mouseenter', function() {
            customCursor.classList.add('hovering');
        });
        
        element.addEventListener('mouseleave', function() {
            customCursor.classList.remove('hovering');
        });
    });
    
    // Data Flow Animation for Hero Section
    const aiVisualDemo = document.querySelector('.ai-visual-demo');
    
    if (aiVisualDemo) {
        // Create data flow container if it doesn't exist
        let dataFlowAnimation = aiVisualDemo.querySelector('.data-flow-animation');
        if (!dataFlowAnimation) {
            dataFlowAnimation = document.createElement('div');
            dataFlowAnimation.className = 'data-flow-animation';
            aiVisualDemo.appendChild(dataFlowAnimation);
        }
        
        // Setup node connections for data flow
        const centralNode = {
            x: aiVisualDemo.clientWidth / 2,
            y: aiVisualDemo.clientHeight / 2
        };
        
        const nodeElements = document.querySelectorAll('.satellite-node');
        const nodes = [];
        
        // Get positions of nodes
        nodeElements.forEach(function(node) {
            const rect = node.getBoundingClientRect();
            const demoRect = aiVisualDemo.getBoundingClientRect();
            
            nodes.push({
                x: rect.left - demoRect.left + rect.width / 2,
                y: rect.top - demoRect.top + rect.height / 2
            });
        });
        
        // Generate data flow particles
        function createDataFlow() {
            // Randomly select source and target nodes
            const sourceIndex = Math.floor(Math.random() * (nodes.length + 1));
            let targetIndex;
            
            do {
                targetIndex = Math.floor(Math.random() * (nodes.length + 1));
            } while (targetIndex === sourceIndex);
            
            const source = sourceIndex === nodes.length ? centralNode : nodes[sourceIndex];
            const target = targetIndex === nodes.length ? centralNode : nodes[targetIndex];
            
            // Create data flow dot
            const dot = document.createElement('div');
            dot.className = 'data-flow-dot';
            dataFlowAnimation.appendChild(dot);
            
            // Position at source
            dot.style.left = source.x + 'px';
            dot.style.top = source.y + 'px';
            
            // Calculate distance and duration
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const duration = distance / 100 * 2; // 2 seconds per 100px
            
            // Configure animation
            dot.style.animation = `flowAnimation ${duration}s linear forwards`;
            
            // Animate to target
            const keyframes = [
                { left: source.x + 'px', top: source.y + 'px' },
                { left: target.x + 'px', top: target.y + 'px' }
            ];
            
            const options = {
                duration: duration * 1000,
                easing: 'linear',
                fill: 'forwards'
            };
            
            dot.animate(keyframes, options);
            
            // Remove after animation completes
            setTimeout(function() {
                dot.remove();
            }, duration * 1000);
        }
        
        // Create data flow dots at intervals
        setInterval(createDataFlow, 300);
    }
    
    // Dark Mode Toggle
    const darkModeToggle = document.createElement('div');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    document.body.appendChild(darkModeToggle);
    
    darkModeToggle.addEventListener('click', function() {
        document.body.classList.toggle('light-mode');
        
        const icon = this.querySelector('i');
        if (document.body.classList.contains('light-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    });
    
    // Enhanced Background Interaction
    const backgroundLayer = document.querySelector('.background-layer');
    if (backgroundLayer) {
        // Create enhanced parallax effect
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const shapes = document.querySelectorAll('.shape');
            shapes.forEach(function(shape, index) {
                const depth = index * 0.05 + 0.05; // Different depths for each shape
                const moveX = (mouseX - 0.5) * depth * 50;
                const moveY = (mouseY - 0.5) * depth * 50;
                
                shape.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${shape.dataset.rotation || 0}deg)`;
            });
            
            const nodeClusters = document.querySelectorAll('.ai-node-cluster');
            nodeClusters.forEach(function(cluster, index) {
                const depth = index * 0.1 + 0.1;
                const moveX = (mouseX - 0.5) * depth * 30;
                const moveY = (mouseY - 0.5) * depth * 30;
                
                cluster.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }
    
    // Satellite Node Interactions
    const aiNodeSystem = document.querySelector('.ai-node-system');
    if (aiNodeSystem) {
        const centralNode = aiNodeSystem.querySelector('.central-node');
        const satelliteNodes = aiNodeSystem.querySelectorAll('.satellite-node');
        
        satelliteNodes.forEach(function(node) {
            node.addEventListener('mouseenter', function() {
                // Highlight connection to central node
                const nodeIndex = Array.from(satelliteNodes).indexOf(node);
                const line = aiNodeSystem.querySelector(`.connection-line:nth-child(${nodeIndex + 1})`);
                
                if (line) {
                    line.style.background = 'linear-gradient(90deg, rgba(0, 238, 255, 0.8), transparent)';
                    line.style.height = '4px';
                }
                
                // Show label
                const label = node.querySelector('.node-label');
                if (label) {
                    label.style.opacity = '1';
                }
                
                // Pulse central node
                if (centralNode) {
                    centralNode.classList.add('pulse-highlight');
                }
                
                // Create data particles flowing from this node to central node
                createDataParticles(node, centralNode);
            });
            
            node.addEventListener('mouseleave', function() {
                // Reset connection
                const nodeIndex = Array.from(satelliteNodes).indexOf(node);
                const line = aiNodeSystem.querySelector(`.connection-line:nth-child(${nodeIndex + 1})`);
                
                if (line) {
                    line.style.background = 'linear-gradient(90deg, var(--primary-400), transparent)';
                    line.style.height = '2px';
                }
                
                // Hide label
                const label = node.querySelector('.node-label');
                if (label) {
                    label.style.opacity = '0';
                }
                
                // Reset central node
                if (centralNode) {
                    centralNode.classList.remove('pulse-highlight');
                }
            });
        });
        
        function createDataParticles(sourceNode, targetNode) {
            if (!sourceNode || !targetNode) return;
            
            const dataFlow = aiNodeSystem.querySelector('.data-flow-particles');
            if (!dataFlow) return;
            
            const sourceRect = sourceNode.getBoundingClientRect();
            const targetRect = targetNode.getBoundingClientRect();
            const dataFlowRect = dataFlow.getBoundingClientRect();
            
            // Calculate positions relative to data flow container
            const sourceX = sourceRect.left - dataFlowRect.left + sourceRect.width / 2;
            const sourceY = sourceRect.top - dataFlowRect.top + sourceRect.height / 2;
            const targetX = targetRect.left - dataFlowRect.left + targetRect.width / 2;
            const targetY = targetRect.top - dataFlowRect.top + targetRect.height / 2;
            
            // Create 3 particles
            for (let i = 0; i < 3; i++) {
                setTimeout(function() {
                    const particle = document.createElement('div');
                    particle.className = 'data-flow-particle';
                    dataFlow.appendChild(particle);
                    
                    // Position at source
                    particle.style.left = sourceX + 'px';
                    particle.style.top = sourceY + 'px';
                    
                    // Calculate animation duration based on distance
                    const dx = targetX - sourceX;
                    const dy = targetY - sourceY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const duration = distance / 100; // 1 second per 100px
                    
                    // Animate to target
                    const keyframes = [
                        { left: sourceX + 'px', top: sourceY + 'px', opacity: 0 },
                        { left: sourceX + dx * 0.2 + 'px', top: sourceY + dy * 0.2 + 'px', opacity: 1 },
                        { left: targetX + 'px', top: targetY + 'px', opacity: 0 }
                    ];
                    
                    const options = {
                        duration: duration * 1000,
                        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                        fill: 'forwards'
                    };
                    
                    particle.animate(keyframes, options);
                    
                    // Remove after animation completes
                    setTimeout(function() {
                        particle.remove();
                    }, duration * 1000);
                }, i * 200); // Stagger particle creation
            }
        }
    }
});
