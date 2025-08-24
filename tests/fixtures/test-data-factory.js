/**
 * Test Data Factory
 * Generates realistic test data, fixtures, and mock objects for comprehensive testing
 */

import crypto from 'crypto';
import path from 'path';

export class TestDataFactory {
  constructor() {
    this.seededRandom = this.createSeededRandom(12345); // Deterministic random for consistent tests
    this.projectTypes = ['web-app', 'mobile-app', 'api-service', 'cli-tool', 'library', 'microservice'];
    this.techStacks = ['nodejs', 'python', 'rust', 'go', 'typescript', 'java'];
    this.complexityLevels = ['simple', 'moderate', 'complex', 'enterprise'];
    this.statusTypes = ['planning', 'in-progress', 'review', 'completed', 'blocked', 'cancelled'];
    this.priorityLevels = ['low', 'medium', 'high', 'critical'];
  }

  createSeededRandom(seed) {
    let m = seed;
    return () => {
      m = (m * 9301 + 49297) % 233280;
      return m / 233280;
    };
  }

  randomChoice(array) {
    return array[Math.floor(this.seededRandom() * array.length)];
  }

  randomInt(min, max) {
    return Math.floor(this.seededRandom() * (max - min + 1)) + min;
  }

  randomString(length = 10, charset = 'abcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(this.seededRandom() * charset.length)];
    }
    return result;
  }

  // Generate realistic feature names
  generateFeatureName() {
    const prefixes = ['user', 'admin', 'system', 'api', 'data', 'real-time', 'automated', 'enhanced'];
    const features = ['authentication', 'dashboard', 'analytics', 'notifications', 'processing', 'management', 'integration', 'monitoring'];
    const suffixes = ['system', 'module', 'service', 'component', 'engine', 'framework', 'platform', 'toolkit'];
    
    const pattern = this.randomChoice(['prefix-feature', 'feature-suffix', 'prefix-feature-suffix']);
    
    switch (pattern) {
      case 'prefix-feature':
        return `${this.randomChoice(prefixes)}-${this.randomChoice(features)}`;
      case 'feature-suffix':
        return `${this.randomChoice(features)}-${this.randomChoice(suffixes)}`;
      case 'prefix-feature-suffix':
        return `${this.randomChoice(prefixes)}-${this.randomChoice(features)}-${this.randomChoice(suffixes)}`;
      default:
        return this.randomChoice(features);
    }
  }

  // Generate realistic epic names
  generateEpicName() {
    const epicTypes = [
      'migration', 'refactoring', 'implementation', 'optimization', 'integration', 
      'enhancement', 'modernization', 'scalability', 'security', 'performance'
    ];
    const subjects = [
      'auth-system', 'payment-gateway', 'user-interface', 'data-pipeline', 
      'api-layer', 'notification-system', 'search-engine', 'reporting-module'
    ];
    
    return `${this.randomChoice(epicTypes)}-${this.randomChoice(subjects)}`;
  }

  // Generate realistic project metadata
  generateProjectMetadata(customOptions = {}) {
    const projectName = customOptions.projectName || this.generateProjectName();
    const projectType = customOptions.projectType || this.randomChoice(this.projectTypes);
    const techStack = customOptions.techStack || this.randomChoice(this.techStacks);
    const complexity = customOptions.complexity || this.randomChoice(this.complexityLevels);
    
    return {
      projectName,
      projectType,
      techStack,
      complexity,
      version: this.generateVersion(),
      author: this.generateAuthor(),
      description: this.generateProjectDescription(projectName, projectType),
      repository: this.generateRepositoryInfo(projectName),
      license: this.randomChoice(['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC']),
      keywords: this.generateKeywords(projectType, techStack),
      dependencies: this.generateDependencies(techStack, complexity),
      createdAt: this.generateTimestamp(-30, 0), // Created within last 30 days
      lastUpdated: this.generateTimestamp(-7, 0) // Updated within last 7 days
    };
  }

  generateProjectName() {
    const adjectives = ['awesome', 'modern', 'smart', 'rapid', 'ultra', 'next-gen', 'pro', 'advanced'];
    const nouns = ['manager', 'builder', 'tracker', 'analyzer', 'optimizer', 'connector', 'processor', 'dashboard'];
    const prefixes = ['cloud', 'micro', 'auto', 'real-time', 'multi', 'super', 'hyper', 'meta'];
    
    const pattern = this.randomChoice(['adjective-noun', 'prefix-noun', 'noun-pro']);
    
    switch (pattern) {
      case 'adjective-noun':
        return `${this.randomChoice(adjectives)}-${this.randomChoice(nouns)}`;
      case 'prefix-noun':
        return `${this.randomChoice(prefixes)}-${this.randomChoice(nouns)}`;
      case 'noun-pro':
        return `${this.randomChoice(nouns)}-pro`;
      default:
        return this.randomChoice(nouns);
    }
  }

  generateVersion() {
    const major = this.randomInt(0, 5);
    const minor = this.randomInt(0, 20);
    const patch = this.randomInt(0, 50);
    const prerelease = this.seededRandom() < 0.2 ? `-${this.randomChoice(['alpha', 'beta', 'rc'])}.${this.randomInt(1, 5)}` : '';
    return `${major}.${minor}.${patch}${prerelease}`;
  }

  generateAuthor() {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Cameron'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Garcia', 'Rodriguez'];
    const firstName = this.randomChoice(firstNames);
    const lastName = this.randomChoice(lastNames);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${this.randomChoice(['example.com', 'test.org', 'demo.net'])}`;
    
    return {
      name: `${firstName} ${lastName}`,
      email,
      username: `${firstName.toLowerCase()}${this.randomInt(10, 999)}`
    };
  }

  generateProjectDescription(projectName, projectType) {
    const templates = {
      'web-app': `A modern ${projectName} web application built for scalability and performance`,
      'mobile-app': `Cross-platform ${projectName} mobile application with native performance`,
      'api-service': `RESTful API service for ${projectName} with comprehensive documentation`,
      'cli-tool': `Command-line interface tool for ${projectName} operations and automation`,
      'library': `Reusable ${projectName} library with comprehensive testing and documentation`,
      'microservice': `Containerized ${projectName} microservice designed for cloud deployment`
    };
    
    return templates[projectType] || `Innovative ${projectName} solution for modern development`;
  }

  generateRepositoryInfo(projectName) {
    const providers = ['github.com', 'gitlab.com', 'bitbucket.org'];
    const organizations = ['acme-corp', 'dev-team', 'open-source', 'tech-solutions'];
    const provider = this.randomChoice(providers);
    const org = this.randomChoice(organizations);
    
    return {
      type: 'git',
      url: `https://${provider}/${org}/${projectName}.git`,
      provider,
      organization: org,
      name: projectName
    };
  }

  generateKeywords(projectType, techStack) {
    const baseKeywords = [projectType, techStack];
    const additionalKeywords = [
      'development', 'automation', 'productivity', 'enterprise', 'scalable',
      'modern', 'testing', 'monitoring', 'integration', 'deployment'
    ];
    
    const keywordCount = this.randomInt(3, 8);
    const selectedKeywords = [...baseKeywords];
    
    while (selectedKeywords.length < keywordCount) {
      const keyword = this.randomChoice(additionalKeywords);
      if (!selectedKeywords.includes(keyword)) {
        selectedKeywords.push(keyword);
      }
    }
    
    return selectedKeywords;
  }

  generateDependencies(techStack, complexity) {
    const dependencyPools = {
      nodejs: [
        'express', 'lodash', 'axios', 'moment', 'uuid', 'joi', 'winston',
        'bcrypt', 'jsonwebtoken', 'cors', 'helmet', 'dotenv'
      ],
      python: [
        'requests', 'numpy', 'pandas', 'flask', 'django', 'sqlalchemy',
        'pytest', 'click', 'pydantic', 'fastapi', 'uvicorn', 'redis'
      ],
      typescript: [
        'express', 'axios', 'lodash', 'uuid', 'joi', 'winston', 'jest',
        '@types/node', '@types/express', 'ts-node', 'typescript'
      ],
      rust: [
        'serde', 'tokio', 'reqwest', 'clap', 'log', 'thiserror', 'anyhow',
        'uuid', 'chrono', 'regex', 'axum', 'sqlx'
      ],
      go: [
        'github.com/gin-gonic/gin', 'github.com/gorilla/mux', 'github.com/stretchr/testify',
        'github.com/spf13/cobra', 'github.com/sirupsen/logrus', 'go.uber.org/zap'
      ],
      java: [
        'spring-boot-starter', 'spring-boot-starter-web', 'junit-jupiter',
        'slf4j-api', 'jackson-databind', 'commons-lang3', 'guava'
      ]
    };
    
    const complexityMultipliers = {
      simple: 0.3,
      moderate: 0.6,
      complex: 0.8,
      enterprise: 1.0
    };
    
    const pool = dependencyPools[techStack] || dependencyPools.nodejs;
    const maxDeps = Math.floor(pool.length * complexityMultipliers[complexity]);
    const depCount = this.randomInt(Math.max(2, maxDeps - 3), maxDeps);
    
    const dependencies = {};
    const selectedDeps = [];
    
    while (selectedDeps.length < depCount) {
      const dep = this.randomChoice(pool);
      if (!selectedDeps.includes(dep)) {
        selectedDeps.push(dep);
        dependencies[dep] = this.generateVersion();
      }
    }
    
    return dependencies;
  }

  generateTimestamp(minDaysAgo, maxDaysAgo) {
    const now = new Date();
    const daysAgo = this.randomInt(minDaysAgo, maxDaysAgo);
    const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return timestamp.toISOString();
  }

  // Generate Genesis XML with realistic content
  generateGenesisXml(epicName, customOptions = {}) {
    const metadata = this.generateProjectMetadata(customOptions);
    const taskCount = customOptions.taskCount || this.randomInt(5, 50);
    const completionRate = customOptions.completionRate || this.seededRandom() * 0.8; // 0-80% completion
    
    const tasks = this.generateTasks(taskCount, completionRate);
    const executionDag = this.generateExecutionDag(tasks);
    const statusTracker = this.generateStatusTracker(tasks, completionRate);
    const metrics = this.generateMetrics(tasks, completionRate);
    const auditLog = this.generateAuditLog(tasks.length);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<projectGenesis>
  <metadata>
    <projectName>${metadata.projectName}</projectName>
    <epicName>${epicName}</epicName>
    <projectType>${metadata.projectType}</projectType>
    <techStack>${metadata.techStack}</techStack>
    <complexity>${metadata.complexity}</complexity>
    <status>${this.getOverallStatus(completionRate)}</status>
    <priority>${this.randomChoice(this.priorityLevels)}</priority>
    <version>${metadata.version}</version>
    <author>
      <name>${metadata.author.name}</name>
      <email>${metadata.author.email}</email>
    </author>
    <createdAt>${metadata.createdAt}</createdAt>
    <lastUpdatedAt>${metadata.lastUpdated}</lastUpdatedAt>
    <estimatedDuration>${this.randomInt(1, 30)} days</estimatedDuration>
    <actualDuration>${Math.floor(this.randomInt(1, 30) * completionRate)} days</actualDuration>
  </metadata>
  
  <vision>
    <problemStatement>${metadata.description}</problemStatement>
    <objectives>
      ${this.generateObjectives(metadata.projectType).map(obj => `<objective>${obj}</objective>`).join('\n      ')}
    </objectives>
    <successCriteria>
      ${this.generateSuccessCriteria().map(criteria => `<criteria>${criteria}</criteria>`).join('\n      ')}
    </successCriteria>
    <stakeholders>
      ${this.generateStakeholders().map(stakeholder => 
        `<stakeholder role="${stakeholder.role}">${stakeholder.name}</stakeholder>`
      ).join('\n      ')}
    </stakeholders>
  </vision>
  
  <executionPlan>
    ${executionDag}
    ${statusTracker}
    <resourceRequirements>
      <developers>${this.randomInt(1, 8)}</developers>
      <estimatedHours>${this.randomInt(40, 800)}</estimatedHours>
      <budget>\$${this.randomInt(5000, 100000)}</budget>
      <infrastructure>
        ${this.generateInfrastructureRequirements().map(req => `<requirement>${req}</requirement>`).join('\n        ')}
      </infrastructure>
    </resourceRequirements>
    <riskAssessment>
      ${this.generateRisks().map(risk => 
        `<risk severity="${risk.severity}" probability="${risk.probability}">
          <description>${risk.description}</description>
          <mitigation>${risk.mitigation}</mitigation>
        </risk>`
      ).join('\n      ')}
    </riskAssessment>
  </executionPlan>
  
  ${metrics}
  ${auditLog}
  
  <qualityGates>
    ${this.generateQualityGates().map(gate => 
      `<gate name="${gate.name}" status="${gate.status}" threshold="${gate.threshold}">
        <description>${gate.description}</description>
      </gate>`
    ).join('\n    ')}
  </qualityGates>
  
  <dependencies>
    ${this.generateProjectDependencies().map(dep => 
      `<dependency type="${dep.type}" status="${dep.status}">
        <name>${dep.name}</name>
        <description>${dep.description}</description>
        <owner>${dep.owner}</owner>
      </dependency>`
    ).join('\n    ')}
  </dependencies>
</projectGenesis>`;
  }

  generateTasks(taskCount, completionRate) {
    const taskTypes = ['development', 'testing', 'documentation', 'review', 'deployment', 'research'];
    const complexities = [1, 2, 3, 4, 5];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    const tasks = [];
    for (let i = 0; i < taskCount; i++) {
      const isCompleted = i < Math.floor(taskCount * completionRate);
      const isInProgress = !isCompleted && i < Math.floor(taskCount * (completionRate + 0.2));
      
      tasks.push({
        id: `task-${i + 1}`,
        name: this.generateTaskName(),
        type: this.randomChoice(taskTypes),
        description: this.generateTaskDescription(),
        complexity: this.randomChoice(complexities),
        priority: this.randomChoice(priorities),
        estimatedHours: this.randomInt(1, 40),
        actualHours: isCompleted ? this.randomInt(1, 45) : (isInProgress ? this.randomInt(1, 20) : 0),
        status: isCompleted ? 'completed' : (isInProgress ? 'in-progress' : 'pending'),
        assignee: this.generateAssignee(),
        dependencies: this.generateTaskDependencies(i, taskCount),
        startDate: isCompleted || isInProgress ? this.generateTimestamp(-20, -1) : null,
        completedDate: isCompleted ? this.generateTimestamp(-10, 0) : null,
        tags: this.generateTaskTags()
      });
    }
    
    return tasks;
  }

  generateTaskName() {
    const actions = ['implement', 'create', 'update', 'refactor', 'optimize', 'test', 'document', 'review'];
    const subjects = ['user interface', 'database schema', 'API endpoints', 'authentication', 'validation', 'error handling', 'logging', 'monitoring'];
    
    return `${this.randomChoice(actions)} ${this.randomChoice(subjects)}`;
  }

  generateTaskDescription() {
    const templates = [
      'Detailed implementation of {subject} with comprehensive error handling and testing',
      'Refactoring {subject} to improve performance and maintainability',
      'Creating comprehensive documentation for {subject} including examples',
      'Implementing {subject} with focus on security and scalability',
      'Optimizing {subject} for better user experience and performance'
    ];
    
    const subjects = ['user authentication system', 'data processing pipeline', 'REST API endpoints', 'user interface components', 'database operations'];
    const template = this.randomChoice(templates);
    const subject = this.randomChoice(subjects);
    
    return template.replace('{subject}', subject);
  }

  generateAssignee() {
    const developers = [
      'Alex Chen', 'Jordan Smith', 'Taylor Johnson', 'Morgan Davis', 'Casey Wilson',
      'Riley Brown', 'Avery Garcia', 'Cameron Rodriguez', 'Drew Martinez', 'Quinn Anderson'
    ];
    
    return this.randomChoice(developers);
  }

  generateTaskDependencies(currentIndex, totalTasks) {
    const dependencies = [];
    const maxDeps = Math.min(3, currentIndex);
    const depCount = this.randomInt(0, maxDeps);
    
    for (let i = 0; i < depCount; i++) {
      const depIndex = this.randomInt(0, currentIndex - 1);
      const depId = `task-${depIndex + 1}`;
      if (!dependencies.includes(depId)) {
        dependencies.push(depId);
      }
    }
    
    return dependencies;
  }

  generateTaskTags() {
    const allTags = ['frontend', 'backend', 'database', 'ui/ux', 'api', 'testing', 'security', 'performance', 'documentation', 'deployment'];
    const tagCount = this.randomInt(1, 4);
    const tags = [];
    
    while (tags.length < tagCount) {
      const tag = this.randomChoice(allTags);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  generateExecutionDag(tasks) {
    const levels = [];
    const maxLevel = Math.ceil(tasks.length / 5); // Group tasks into levels
    
    for (let level = 1; level <= maxLevel; level++) {
      const levelTasks = tasks.filter((_, index) => 
        Math.floor(index / 5) === level - 1
      );
      
      if (levelTasks.length > 0) {
        levels.push(`
    <parallelGroup level="${level}">
      ${levelTasks.map(task => 
        `<taskRef id="${task.id}" complexity="${task.complexity}" priority="${task.priority}"/>`
      ).join('\n      ')}
    </parallelGroup>`);
      }
    }
    
    return `
    <executionDag>
      <parallelSets>${levels.join('')}
      </parallelSets>
    </executionDag>`;
  }

  generateStatusTracker(tasks, completionRate) {
    const pending = tasks.filter(task => task.status === 'pending');
    const inProgress = tasks.filter(task => task.status === 'in-progress');
    const completed = tasks.filter(task => task.status === 'completed');
    const blocked = tasks.filter(() => this.seededRandom() < 0.05); // 5% chance of being blocked
    
    return `
    <statusTracker>
      <pending>
        ${pending.map(task => `<taskRef id="${task.id}"/>`).join('\n        ')}
      </pending>
      <inProgress>
        ${inProgress.map(task => `<taskRef id="${task.id}"/>`).join('\n        ')}
      </inProgress>
      <completed>
        ${completed.map(task => `<taskRef id="${task.id}"/>`).join('\n        ')}
      </completed>
      <blocked>
        ${blocked.map(task => `<taskRef id="${task.id}"/>`).join('\n        ')}
      </blocked>
      <failed/>
    </statusTracker>`;
  }

  generateMetrics(tasks, completionRate) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const blockedTasks = Math.floor(totalTasks * 0.05);
    
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + task.actualHours, 0);
    const velocity = completedTasks > 0 ? totalActualHours / completedTasks : 0;
    
    return `
  <metrics>
    <progress>
      <totalTasks>${totalTasks}</totalTasks>
      <completedTasks>${completedTasks}</completedTasks>
      <inProgressTasks>${inProgressTasks}</inProgressTasks>
      <blockedTasks>${blockedTasks}</blockedTasks>
      <percentageComplete>${Math.round((completedTasks / totalTasks) * 100)}</percentageComplete>
    </progress>
    <time>
      <estimatedHours>${totalEstimatedHours}</estimatedHours>
      <actualHours>${totalActualHours}</actualHours>
      <remainingHours>${totalEstimatedHours - totalActualHours}</remainingHours>
      <velocity>${velocity.toFixed(2)} hours/task</velocity>
      <burnRate>${(totalActualHours / Math.max(1, Date.now() - new Date(this.generateTimestamp(-20, -1)).getTime())).toFixed(6)}</burnRate>
    </time>
    <quality>
      <codeReviews>${this.randomInt(5, 50)}</codeReviews>
      <testsWritten>${this.randomInt(10, 200)}</testsWritten>
      <bugsFound>${this.randomInt(2, 25)}</bugsFound>
      <bugsFixed>${this.randomInt(1, 20)}</bugsFixed>
      <testCoverage>${this.randomInt(70, 98)}%</testCoverage>
    </quality>
    <team>
      <contributors>${this.randomInt(2, 8)}</contributors>
      <totalCommits>${this.randomInt(50, 500)}</totalCommits>
      <avgCommitsPerDay>${this.randomInt(5, 25)}</avgCommitsPerDay>
    </team>
  </metrics>`;
  }

  generateAuditLog(taskCount) {
    const eventTypes = ['task_created', 'task_started', 'task_completed', 'status_changed', 'dependency_added', 'priority_updated'];
    const logEntries = [];
    const entryCount = Math.min(50, taskCount * 3); // Max 50 entries
    
    for (let i = 0; i < entryCount; i++) {
      const eventType = this.randomChoice(eventTypes);
      const timestamp = this.generateTimestamp(-30, 0);
      const user = this.generateAssignee();
      const taskId = `task-${this.randomInt(1, taskCount)}`;
      
      logEntries.push(`
    <entry>
      <timestamp>${timestamp}</timestamp>
      <event>${eventType}</event>
      <user>${user}</user>
      <target>${taskId}</target>
      <description>${this.generateAuditDescription(eventType, taskId)}</description>
    </entry>`);
    }
    
    return `
  <auditLog>${logEntries.join('')}
  </auditLog>`;
  }

  generateAuditDescription(eventType, taskId) {
    const descriptions = {
      task_created: `Created new task ${taskId} with initial requirements`,
      task_started: `Started working on task ${taskId}`,
      task_completed: `Successfully completed task ${taskId}`,
      status_changed: `Changed status of task ${taskId}`,
      dependency_added: `Added dependency to task ${taskId}`,
      priority_updated: `Updated priority for task ${taskId}`
    };
    
    return descriptions[eventType] || `Updated task ${taskId}`;
  }

  generateObjectives(projectType) {
    const objectivesByType = {
      'web-app': [
        'Create responsive and accessible user interface',
        'Implement secure user authentication and authorization',
        'Ensure cross-browser compatibility',
        'Optimize for performance and SEO'
      ],
      'mobile-app': [
        'Develop native mobile experience',
        'Implement offline functionality',
        'Ensure smooth animations and transitions',
        'Optimize battery usage and performance'
      ],
      'api-service': [
        'Design RESTful API with clear documentation',
        'Implement robust error handling and validation',
        'Ensure scalability and high availability',
        'Provide comprehensive testing coverage'
      ],
      'cli-tool': [
        'Create intuitive command-line interface',
        'Implement comprehensive help system',
        'Ensure cross-platform compatibility',
        'Provide automation capabilities'
      ]
    };
    
    return objectivesByType[projectType] || objectivesByType['web-app'];
  }

  generateSuccessCriteria() {
    return [
      'All acceptance tests pass successfully',
      'Performance meets specified benchmarks',
      'Security requirements are fully satisfied',
      'Documentation is complete and accurate',
      'Code review approval from senior developers'
    ];
  }

  generateStakeholders() {
    return [
      { role: 'Product Owner', name: this.generateAssignee() },
      { role: 'Technical Lead', name: this.generateAssignee() },
      { role: 'QA Engineer', name: this.generateAssignee() },
      { role: 'DevOps Engineer', name: this.generateAssignee() }
    ];
  }

  generateInfrastructureRequirements() {
    return [
      'Cloud hosting with auto-scaling capabilities',
      'Database with backup and replication',
      'CDN for static asset delivery',
      'Monitoring and logging infrastructure',
      'CI/CD pipeline with automated testing'
    ];
  }

  generateRisks() {
    const risks = [
      {
        description: 'Third-party API dependencies may cause delays',
        severity: 'medium',
        probability: 'low',
        mitigation: 'Implement fallback mechanisms and circuit breakers'
      },
      {
        description: 'Complex business logic may require additional development time',
        severity: 'high',
        probability: 'medium',
        mitigation: 'Break down complex features into smaller, manageable tasks'
      },
      {
        description: 'Security vulnerabilities in dependencies',
        severity: 'high',
        probability: 'low',
        mitigation: 'Regular security audits and dependency updates'
      },
      {
        description: 'Performance issues under high load',
        severity: 'medium',
        probability: 'medium',
        mitigation: 'Implement comprehensive load testing and optimization'
      }
    ];
    
    return this.randomChoice([2, 3, 4]) === 2 ? risks.slice(0, 2) : 
           this.randomChoice([3, 4]) === 3 ? risks.slice(0, 3) : risks;
  }

  generateQualityGates() {
    return [
      {
        name: 'Code Coverage',
        status: this.randomChoice(['passed', 'failed', 'pending']),
        threshold: '90%',
        description: 'Minimum code coverage for all modules'
      },
      {
        name: 'Performance Tests',
        status: this.randomChoice(['passed', 'failed', 'pending']),
        threshold: '< 200ms response time',
        description: 'API response time requirements'
      },
      {
        name: 'Security Scan',
        status: this.randomChoice(['passed', 'failed', 'pending']),
        threshold: '0 critical vulnerabilities',
        description: 'No critical security vulnerabilities allowed'
      },
      {
        name: 'Code Review',
        status: this.randomChoice(['passed', 'failed', 'pending']),
        threshold: '100% review coverage',
        description: 'All code changes must be reviewed'
      }
    ];
  }

  generateProjectDependencies() {
    return [
      {
        type: 'internal',
        status: 'ready',
        name: 'User Management Service',
        description: 'Required for authentication and user operations',
        owner: 'Platform Team'
      },
      {
        type: 'external',
        status: 'pending',
        name: 'Payment Gateway Integration',
        description: 'Third-party payment processing service',
        owner: 'External Vendor'
      },
      {
        type: 'infrastructure',
        status: 'in-progress',
        name: 'Database Migration',
        description: 'Upgrade to latest database version',
        owner: 'DevOps Team'
      }
    ];
  }

  getOverallStatus(completionRate) {
    if (completionRate === 0) return 'planning';
    if (completionRate < 0.3) return 'in-progress';
    if (completionRate < 0.8) return 'in-progress';
    if (completionRate < 1.0) return 'review';
    return 'completed';
  }

  // Generate realistic file content
  generateFileContent(fileType, size = 'medium') {
    const sizeMultipliers = { small: 0.3, medium: 1, large: 3, huge: 10 };
    const multiplier = sizeMultipliers[size] || 1;
    
    switch (fileType) {
      case 'javascript':
        return this.generateJavaScriptContent(multiplier);
      case 'typescript':
        return this.generateTypeScriptContent(multiplier);
      case 'python':
        return this.generatePythonContent(multiplier);
      case 'json':
        return this.generateJsonContent(multiplier);
      case 'yaml':
        return this.generateYamlContent(multiplier);
      case 'markdown':
        return this.generateMarkdownContent(multiplier);
      case 'xml':
        return this.generateXmlContent(multiplier);
      default:
        return this.generateGenericContent(multiplier);
    }
  }

  generateJavaScriptContent(multiplier) {
    const baseContent = `
// ${this.generateFeatureName()} Module
const ${this.randomString(8)} = require('${this.randomChoice(['lodash', 'axios', 'express', 'uuid'])}');

class ${this.generateClassName()} {
  constructor(options = {}) {
    this.config = Object.assign({
      timeout: 5000,
      retries: 3,
      endpoint: '${this.generateApiEndpoint()}'
    }, options);
  }

  async ${this.generateMethodName()}(data) {
    try {
      const result = await this.processData(data);
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in ${this.generateMethodName()}:', error);
      throw error;
    }
  }

  processData(data) {
    // Implementation details
    return data.map(item => ({
      id: item.id,
      processed: true,
      value: item.value * ${this.randomInt(1, 10)}
    }));
  }
}

module.exports = ${this.generateClassName()};
`;
    
    return this.expandContent(baseContent, multiplier);
  }

  generateTypeScriptContent(multiplier) {
    const baseContent = `
// ${this.generateFeatureName()} Service
import { ${this.randomChoice(['Logger', 'Config', 'Database', 'Cache'])} } from './${this.randomString(6)}';

interface ${this.generateInterfaceName()} {
  id: string;
  name: string;
  status: '${this.randomChoice(['active', 'inactive', 'pending'])}';
  createdAt: Date;
  metadata?: Record<string, any>;
}

export class ${this.generateClassName()}<T extends ${this.generateInterfaceName()}> {
  private readonly logger = new Logger('${this.generateClassName()}');

  constructor(
    private readonly config: ${this.generateConfigType()},
    private readonly database: Database
  ) {}

  async create${this.generateEntityName()}(data: Partial<T>): Promise<T> {
    this.logger.info('Creating ${this.generateEntityName().toLowerCase()}', { data });
    
    const entity: T = {
      ...data,
      id: '${this.randomString(12)}',
      createdAt: new Date(),
      status: 'active'
    } as T;

    await this.database.save(entity);
    return entity;
  }

  async findById(id: string): Promise<T | null> {
    return this.database.findOne<T>({ id });
  }

  private validateInput(data: Partial<T>): boolean {
    return data.name !== undefined && data.name.length > 0;
  }
}
`;
    
    return this.expandContent(baseContent, multiplier);
  }

  generatePythonContent(multiplier) {
    const baseContent = `
"""
${this.generateFeatureName()} Module
Provides functionality for ${this.generateProjectDescription('test', 'api-service')}
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class ${this.generateClassName()}:
    """${this.generateProjectDescription('Service', 'api-service')}"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {
            'timeout': ${this.randomInt(5, 30)},
            'max_retries': ${this.randomInt(2, 5)},
            'endpoint': '${this.generateApiEndpoint()}'
        }
        self.session = None
        
    async def ${this.generateMethodName()}(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Process data with error handling and validation
        
        Args:
            data: List of items to process
            
        Returns:
            Dictionary containing processing results
            
        Raises:
            ValueError: If data validation fails
            ConnectionError: If external service is unavailable
        """
        try:
            validated_data = self._validate_input(data)
            result = await self._process_items(validated_data)
            
            return {
                'success': True,
                'processed': len(result),
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'data': result
            }
        except Exception as e:
            logger.error(f"Error processing data: {e}")
            raise
    
    def _validate_input(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate input data structure"""
        if not isinstance(data, list):
            raise ValueError("Data must be a list")
        
        for item in data:
            if not isinstance(item, dict) or 'id' not in item:
                raise ValueError("Each item must be a dict with 'id' field")
        
        return data
    
    async def _process_items(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process individual items"""
        tasks = [self._process_single_item(item) for item in data]
        return await asyncio.gather(*tasks)
    
    async def _process_single_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single item"""
        await asyncio.sleep(0.1)  # Simulate processing
        return {
            **item,
            'processed_at': datetime.now(timezone.utc).isoformat(),
            'status': '${this.randomChoice(['completed', 'processed', 'validated'])}'
        }
`;
    
    return this.expandContent(baseContent, multiplier);
  }

  generateJsonContent(multiplier) {
    const data = {
      name: this.generateProjectName(),
      version: this.generateVersion(),
      description: this.generateProjectDescription('test', 'library'),
      author: this.generateAuthor(),
      license: 'MIT',
      repository: this.generateRepositoryInfo('test-repo'),
      dependencies: this.generateDependencies('nodejs', 'moderate'),
      scripts: {
        start: 'node index.js',
        test: 'jest',
        build: 'webpack --mode production',
        dev: 'nodemon index.js',
        lint: 'eslint src/',
        'test:watch': 'jest --watch'
      },
      config: {
        api: {
          endpoint: this.generateApiEndpoint(),
          timeout: this.randomInt(5000, 30000),
          retries: this.randomInt(2, 5)
        },
        database: {
          host: 'localhost',
          port: this.randomInt(3000, 9000),
          name: `${this.randomString(8)}_db`
        },
        features: {
          enableCache: this.seededRandom() > 0.5,
          enableLogging: true,
          enableMetrics: this.seededRandom() > 0.3
        }
      }
    };
    
    let jsonContent = JSON.stringify(data, null, 2);
    
    // Expand based on multiplier
    if (multiplier > 1) {
      const expandedData = { ...data };
      expandedData.extendedConfig = {};
      
      for (let i = 0; i < Math.floor(multiplier * 10); i++) {
        expandedData.extendedConfig[`option_${i}`] = {
          enabled: this.seededRandom() > 0.5,
          value: this.randomInt(1, 1000),
          description: `Configuration option ${i}`,
          tags: Array.from({length: this.randomInt(1, 5)}, () => this.randomString(6))
        };
      }
      
      jsonContent = JSON.stringify(expandedData, null, 2);
    }
    
    return jsonContent;
  }

  generateYamlContent(multiplier) {
    const config = {
      name: this.generateProjectName(),
      version: this.generateVersion(),
      environment: this.randomChoice(['development', 'staging', 'production']),
      services: [],
      database: {
        host: 'localhost',
        port: this.randomInt(3000, 9000),
        name: `${this.randomString(8)}_db`,
        ssl: this.seededRandom() > 0.5
      },
      cache: {
        type: this.randomChoice(['redis', 'memcached', 'memory']),
        ttl: this.randomInt(300, 3600)
      },
      logging: {
        level: this.randomChoice(['debug', 'info', 'warn', 'error']),
        format: 'json',
        destinations: ['console', 'file']
      }
    };
    
    const serviceCount = Math.floor(multiplier * 3);
    for (let i = 0; i < serviceCount; i++) {
      config.services.push({
        name: `${this.randomString(8)}-service`,
        port: this.randomInt(3000, 9000),
        replicas: this.randomInt(1, 5),
        resources: {
          cpu: `${this.randomInt(100, 2000)}m`,
          memory: `${this.randomInt(128, 2048)}Mi`
        },
        endpoints: [
          `/api/v1/${this.randomString(6)}`,
          `/health`,
          `/metrics`
        ]
      });
    }
    
    // Convert to YAML-like string representation
    return this.objectToYamlString(config);
  }

  generateMarkdownContent(multiplier) {
    const projectName = this.generateProjectName();
    const baseContent = `# ${projectName}

${this.generateProjectDescription(projectName, 'library')}

## Features

${Array.from({length: Math.floor(multiplier * 5)}, (_, i) => 
  `- ${this.generateFeatureName()}`
).join('\n')}

## Installation

\`\`\`bash
npm install ${projectName}
# or
yarn add ${projectName}
\`\`\`

## Usage

\`\`\`javascript
const ${this.toCamelCase(projectName)} = require('${projectName}');

const instance = new ${this.toPascalCase(projectName)}({
  apiKey: 'your-api-key',
  timeout: 5000
});

// Basic usage
const result = await instance.${this.generateMethodName()}({
  data: 'sample data'
});
\`\`\`

## API Reference

### ${this.generateClassName()}

Main class for ${projectName} operations.

#### Constructor

\`\`\`javascript
new ${this.toPascalCase(projectName)}(options)
\`\`\`

**Parameters:**
- \`options\` (Object): Configuration options
  - \`apiKey\` (string): Your API key
  - \`timeout\` (number): Request timeout in milliseconds
  - \`retries\` (number): Number of retry attempts

#### Methods

${Array.from({length: Math.floor(multiplier * 3)}, (_, i) => {
  const methodName = this.generateMethodName();
  return `##### ${methodName}()

\`\`\`javascript
instance.${methodName}(params)
\`\`\`

${this.generateProjectDescription(methodName, 'method')}

**Parameters:**
- \`params\` (Object): Method parameters

**Returns:** Promise resolving to result object`;
}).join('\n\n')}

## Examples

### Basic Example

\`\`\`javascript
const example = async () => {
  try {
    const result = await instance.${this.generateMethodName()}({
      input: 'example data'
    });
    console.log(result);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
`;
    
    return baseContent;
  }

  generateXmlContent(multiplier) {
    return this.generateGenesisXml(this.generateEpicName(), {
      taskCount: Math.floor(multiplier * 20),
      completionRate: this.seededRandom()
    });
  }

  generateGenericContent(multiplier) {
    const paragraphs = [];
    const paragraphCount = Math.floor(multiplier * 10);
    
    for (let i = 0; i < paragraphCount; i++) {
      const sentences = [];
      const sentenceCount = this.randomInt(3, 8);
      
      for (let j = 0; j < sentenceCount; j++) {
        sentences.push(this.generateSentence());
      }
      
      paragraphs.push(sentences.join(' '));
    }
    
    return paragraphs.join('\n\n');
  }

  generateSentence() {
    const subjects = ['The system', 'This feature', 'The application', 'Our solution', 'The implementation'];
    const verbs = ['provides', 'enables', 'supports', 'implements', 'delivers'];
    const objects = ['enhanced functionality', 'improved performance', 'better user experience', 'scalable architecture', 'robust security'];
    const modifiers = ['with advanced capabilities', 'through innovative design', 'using modern technologies', 'via automated processes'];
    
    return `${this.randomChoice(subjects)} ${this.randomChoice(verbs)} ${this.randomChoice(objects)} ${this.randomChoice(modifiers)}.`;
  }

  // Helper methods
  expandContent(baseContent, multiplier) {
    if (multiplier <= 1) return baseContent;
    
    const expansions = [];
    const expansionCount = Math.floor((multiplier - 1) * 5);
    
    for (let i = 0; i < expansionCount; i++) {
      expansions.push(`
  // Additional method ${i + 1}
  async ${this.generateMethodName()}${i}() {
    // Implementation for ${this.generateFeatureName()}
    return this.processData();
  }`);
    }
    
    return baseContent + expansions.join('\n');
  }

  generateClassName() {
    const prefixes = ['Base', 'Core', 'Main', 'Primary', 'Advanced'];
    const suffixes = ['Manager', 'Service', 'Handler', 'Processor', 'Controller'];
    return `${this.randomChoice(prefixes)}${this.randomChoice(suffixes)}`;
  }

  generateInterfaceName() {
    const prefixes = ['I', ''];
    const names = ['Entity', 'Model', 'Data', 'Item', 'Record'];
    return `${this.randomChoice(prefixes)}${this.randomChoice(names)}`;
  }

  generateConfigType() {
    const types = ['Config', 'Settings', 'Options', 'Parameters'];
    return this.randomChoice(types);
  }

  generateEntityName() {
    const entities = ['User', 'Product', 'Order', 'Item', 'Record', 'Resource'];
    return this.randomChoice(entities);
  }

  generateMethodName() {
    const verbs = ['get', 'fetch', 'create', 'update', 'delete', 'process', 'handle', 'manage'];
    const objects = ['Data', 'Item', 'Record', 'Entity', 'Resource', 'Config'];
    return `${this.randomChoice(verbs)}${this.randomChoice(objects)}`;
  }

  generateApiEndpoint() {
    const versions = ['v1', 'v2', 'v3'];
    const resources = ['users', 'products', 'orders', 'items', 'data', 'resources'];
    return `https://api.${this.randomString(8)}.com/${this.randomChoice(versions)}/${this.randomChoice(resources)}`;
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    const camelCase = this.toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }

  objectToYamlString(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}- \n`;
            yaml += this.objectToYamlString(item, indent + 1).replace(/^/gm, '  ');
          } else {
            yaml += `${spaces}- ${item}\n`;
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.objectToYamlString(value, indent + 1);
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }
}

// Export singleton instance
export const testDataFactory = new TestDataFactory();