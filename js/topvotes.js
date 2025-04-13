
document.addEventListener('DOMContentLoaded', () => {
  // Sample data - in a real app, this would come from localStorage or an API
  const ideas = [
    {
      id: '1',
      title: 'AI-Powered Recipe Generator',
      description: 'An app that suggests recipes based on ingredients you have at home, with dietary preference filters.',
      tags: ['AI', 'Machine Learning', 'Food'],
      difficulty: 'intermediate',
      upvotes: 42,
      comments: 15,
      nickname: 'ChefCoder',
      createdAt: '2023-10-15T09:30:00Z'
    },
    {
      id: '2',
      title: 'Smart Home Energy Monitor',
      description: 'A device that tracks electricity usage in real-time with suggestions for reducing consumption.',
      tags: ['IoT', 'Hardware', 'Energy'],
      difficulty: 'advanced',
      upvotes: 35,
      comments: 8,
      nickname: 'EcoBuilder',
      createdAt: '2023-11-02T14:45:00Z'
    },
    {
      id: '3',
      title: 'Language Learning Chatbot',
      description: 'Conversational AI that helps you practice new languages with real-time corrections.',
      tags: ['AI', 'Education', 'Chatbot'],
      difficulty: 'intermediate',
      upvotes: 28,
      comments: 12,
      nickname: 'PolyglotDev',
      createdAt: '2023-09-20T11:15:00Z'
    },
    {
      id: '4',
      title: 'AR City Navigation',
      description: 'Augmented reality overlay that helps tourists navigate cities with historical info points.',
      tags: ['AR', 'Mobile', 'Navigation'],
      difficulty: 'advanced',
      upvotes: 19,
      comments: 5,
      nickname: 'TravelTech',
      createdAt: '2023-11-10T16:20:00Z'
    },
    {
      id: '5',
      title: 'Fitness Progress Tracker',
      description: 'App that visualizes your workout progress with motivational milestones and social sharing.',
      tags: ['Health', 'Mobile', 'Data Visualization'],
      difficulty: 'beginner',
      upvotes: 15,
      comments: 7,
      nickname: 'FitCoder',
      createdAt: '2023-10-28T08:10:00Z'
    },
    {
      id: '6',
      title: 'Coding Challenge Platform',
      description: 'Weekly coding challenges with peer review and mentor feedback system.',
      tags: ['Education', 'Web', 'Community'],
      difficulty: 'beginner',
      upvotes: 12,
      comments: 9,
      nickname: 'CodeMentor',
      createdAt: '2023-11-05T13:25:00Z'
    }
  ];

  // DOM elements
  const ideasContainer = document.getElementById('ideasContainer');
  const sortOptions = document.querySelectorAll('.sort-option');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  
  // State
  let currentSort = 'top';
  let displayCount = 6;
  let filteredIdeas = [...ideas];

  // Initial display
  displayIdeas();

  // Sort options
  sortOptions.forEach(option => {
    option.addEventListener('click', () => {
      sortOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      currentSort = option.dataset.sort;
      displayCount = 6;
      sortIdeas();
      displayIdeas();
    });
  });

  // Search functionality
  searchBtn.addEventListener('click', () => {
    displayCount = 6;
    filterIdeas();
    displayIdeas();
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      displayCount = 6;
      filterIdeas();
      displayIdeas();
    }
  });

  // Load more
  loadMoreBtn.addEventListener('click', () => {
    displayCount += 3;
    displayIdeas();
    
    if (displayCount >= filteredIdeas.length) {
      loadMoreBtn.style.display = 'none';
    }
  });

  // Helper functions
  function sortIdeas() {
    switch(currentSort) {
      case 'newest':
        filteredIdeas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'discussed':
        filteredIdeas.sort((a, b) => (b.comments || 0) - (a.comments || 0));
        break;
      default: // 'top'
        filteredIdeas.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    }
  }

  function filterIdeas() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
      filteredIdeas = [...ideas];
    } else {
      filteredIdeas = ideas.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm) ||
        idea.description.toLowerCase().includes(searchTerm) ||
        (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    sortIdeas();
  }

  function displayIdeas() {
    const ideasToShow = filteredIdeas.slice(0, displayCount);
    
    if (ideasToShow.length === 0) {
      ideasContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-lightbulb"></i>
          <p>No ideas found matching your search</p>
        </div>
      `;
      loadMoreBtn.style.display = 'none';
      return;
    }
    
    ideasContainer.innerHTML = ideasToShow.map(idea => createIdeaCard(idea)).join('');
    
    if (displayCount >= filteredIdeas.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  function createIdeaCard(idea) {
    const date = new Date(idea.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `
      <div class="idea-card ${idea.upvotes > 30 ? 'featured' : ''}">
        <h3>${idea.title}</h3>
        <p>${idea.description}</p>
        
        <div class="tags-container">
          ${idea.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
          <span class="difficulty ${idea.difficulty}">
            ${idea.difficulty?.charAt(0).toUpperCase() + idea.difficulty?.slice(1) || 'Not specified'}
          </span>
        </div>
        
        <div class="idea-meta">
          <span>${idea.nickname || 'Anonymous'}</span>
          <span>${formattedDate}</span>
          <span class="upvote-count">
            <i class="fas fa-thumbs-up"></i> ${idea.upvotes || 0}
            ${idea.comments ? ` • <i class="fas fa-comment"></i> ${idea.comments}` : ''}
          </span>
        </div>
      </div>
    `;
  }
});
