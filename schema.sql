-- ============================================
-- MARINE ECO NEWS - Database Schema (MySQL/PostgreSQL)
-- ============================================

-- USERS TABLE
CREATE TABLE users (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'editor', 'user') DEFAULT 'user',
  avatar      VARCHAR(255),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ARTICLES TABLE
CREATE TABLE articles (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(300) NOT NULL,
  slug        VARCHAR(300) UNIQUE,
  content     LONGTEXT NOT NULL,
  excerpt     VARCHAR(500),
  tag         VARCHAR(100),
  emoji       VARCHAR(10) DEFAULT '📰',
  cover_image VARCHAR(255),
  author_id   INT NOT NULL,
  status      ENUM('draft', 'pending', 'published', 'archived') DEFAULT 'draft',
  views       INT DEFAULT 0,
  is_breaking BOOLEAN DEFAULT FALSE,
  lang        ENUM('ar', 'fr', 'en') DEFAULT 'ar',
  published_at TIMESTAMP,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- COMMENTS TABLE
CREATE TABLE comments (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  text        TEXT NOT NULL,
  article_id  INT NOT NULL,
  user_id     INT NOT NULL,
  status      ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  likes       INT DEFAULT 0,
  parent_id   INT DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);

-- PERMISSIONS TABLE
CREATE TABLE permissions (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  role        ENUM('admin', 'editor', 'user') NOT NULL,
  resource    VARCHAR(100) NOT NULL,  -- 'articles', 'comments', 'users'
  action      VARCHAR(50) NOT NULL,   -- 'create', 'read', 'update', 'delete', 'publish'
  allowed     BOOLEAN DEFAULT FALSE,
  UNIQUE KEY role_resource_action (role, resource, action)
);

-- SETTINGS TABLE
CREATE TABLE settings (
  `key`       VARCHAR(100) PRIMARY KEY,
  `value`     TEXT,
  description VARCHAR(255),
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MAP INCIDENTS TABLE
CREATE TABLE map_incidents (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  type        ENUM('pollution', 'protection', 'research') NOT NULL,
  severity    ENUM('low', 'medium', 'high', 'info', 'good') DEFAULT 'medium',
  latitude    DECIMAL(10, 7) NOT NULL,
  longitude   DECIMAL(10, 7) NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  reported_by INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- ===== DEFAULT DATA =====

INSERT INTO permissions (role, resource, action, allowed) VALUES
  ('admin',  'articles', 'create',  TRUE),
  ('admin',  'articles', 'delete',  TRUE),
  ('admin',  'articles', 'publish', TRUE),
  ('admin',  'comments', 'delete',  TRUE),
  ('admin',  'users',    'update',  TRUE),
  ('editor', 'articles', 'create',  TRUE),
  ('editor', 'articles', 'update',  TRUE),
  ('editor', 'comments', 'delete',  TRUE),
  ('user',   'articles', 'read',    TRUE),
  ('user',   'comments', 'create',  TRUE);

INSERT INTO settings (`key`, `value`, description) VALUES
  ('site_name',     'البيئة البحرية',    'اسم الموقع'),
  ('breaking_news', '🔴 ارتفاع درجة حرارة المحيطات بنسبة 2.1 درجة', 'الخبر العاجل'),
  ('maintenance',   'false',              'وضع الصيانة'),
  ('lang_default',  'ar',                'اللغة الافتراضية'),
  ('articles_per_page', '12',            'عدد المقالات في الصفحة');

-- ===== INDEXES =====
CREATE INDEX idx_articles_status    ON articles(status);
CREATE INDEX idx_articles_tag       ON articles(tag);
CREATE INDEX idx_articles_author    ON articles(author_id);
CREATE INDEX idx_comments_article   ON comments(article_id);
CREATE INDEX idx_comments_status    ON comments(status);
CREATE INDEX idx_map_type           ON map_incidents(type);
