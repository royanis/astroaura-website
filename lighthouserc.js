module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4000/',
        'http://localhost:4000/features/',
        'http://localhost:4000/blog/',
        'http://localhost:4000/about/',
        'http://localhost:4000/contact/'
      ],
      startServerCommand: 'bundle exec jekyll serve --port 4000 --detach',
      startServerReadyPattern: 'Server running',
      startServerReadyTimeout: 30000
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.6 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};