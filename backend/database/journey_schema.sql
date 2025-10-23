-- Journey Persistence Schema
-- This schema stores the complete journey state from the frontend journey store

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Journeys table (main journey metadata)
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Journey',
    description TEXT DEFAULT 'No description',
    is_published BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    is_read_only BOOLEAN DEFAULT FALSE,
    is_editable BOOLEAN DEFAULT TRUE,
    is_view_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR(255) -- Optional: if you want to associate with users
);

-- Journey nodes (canvas nodes)
CREATE TABLE journey_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    node_id VARCHAR(255) NOT NULL, -- Frontend node ID
    node_type VARCHAR(100) NOT NULL,
    node_subtype VARCHAR(100) NOT NULL,
    position_x DECIMAL(10,2) NOT NULL,
    position_y DECIMAL(10,2) NOT NULL,
    data JSONB DEFAULT '{}',
    selected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journey_id, node_id)
);

-- Journey edges (canvas connections)
CREATE TABLE journey_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    edge_id VARCHAR(255) NOT NULL, -- Frontend edge ID
    source_node VARCHAR(255) NOT NULL,
    target_node VARCHAR(255) NOT NULL,
    data JSONB DEFAULT '{}',
    selected BOOLEAN DEFAULT FALSE,
    edge_type VARCHAR(100),
    animated BOOLEAN DEFAULT FALSE,
    style JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journey_id, edge_id)
);

-- Journey goals
CREATE TABLE journey_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    goal_id VARCHAR(255) NOT NULL, -- Frontend goal ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(15,2) NOT NULL,
    current_value DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- not-started, in-progress, completed, cancelled, deleted, archived, active
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journey_id, goal_id)
);

-- Journey milestones
CREATE TABLE journey_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    milestone_id VARCHAR(255) NOT NULL, -- Frontend milestone ID
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- pending, in-progress, completed, overdue, cancelled, deleted, archived, active
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    dependencies JSONB DEFAULT '[]', -- Array of milestone IDs
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journey_id, milestone_id)
     data JSONB NOT NULL DEFAULT '{}',
);

-- Journey reports
CREATE TABLE journey_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    report_id VARCHAR(255) NOT NULL, -- Frontend report ID
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(20) NOT NULL, -- progress, performance, summary
    generated_at TIMESTAMP DEFAULT NOW(),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(journey_id, report_id)
);

-- Indexes for better performance
CREATE INDEX idx_journeys_user_id ON journeys(user_id);
CREATE INDEX idx_journeys_created_at ON journeys(created_at);
CREATE INDEX idx_journeys_updated_at ON journeys(updated_at);
CREATE INDEX idx_journeys_is_published ON journeys(is_published);
CREATE INDEX idx_journeys_is_deleted ON journeys(is_deleted);

CREATE INDEX idx_journey_nodes_journey_id ON journey_nodes(journey_id);
CREATE INDEX idx_journey_nodes_node_id ON journey_nodes(node_id);
CREATE INDEX idx_journey_nodes_type ON journey_nodes(node_type);

CREATE INDEX idx_journey_edges_journey_id ON journey_edges(journey_id);
CREATE INDEX idx_journey_edges_source ON journey_edges(source_node);
CREATE INDEX idx_journey_edges_target ON journey_edges(target_node);

CREATE INDEX idx_journey_goals_journey_id ON journey_goals(journey_id);
CREATE INDEX idx_journey_goals_status ON journey_goals(status);
CREATE INDEX idx_journey_goals_priority ON journey_goals(priority);
CREATE INDEX idx_journey_goals_deadline ON journey_goals(deadline);

CREATE INDEX idx_journey_milestones_journey_id ON journey_milestones(journey_id);
CREATE INDEX idx_journey_milestones_status ON journey_milestones(status);
CREATE INDEX idx_journey_milestones_target_date ON journey_milestones(target_date);

CREATE INDEX idx_journey_reports_journey_id ON journey_reports(journey_id);
CREATE INDEX idx_journey_reports_type ON journey_reports(report_type);
CREATE INDEX idx_journey_reports_generated_at ON journey_reports(generated_at);

-- Journey snapshots (optional full-state archive per save)
CREATE TABLE IF NOT EXISTS journey_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES journeys(id) ON DELETE CASCADE,
    snapshot JSONB NOT NULL,
    taken_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journey_snapshots_journey_id ON journey_snapshots(journey_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON journeys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_nodes_updated_at BEFORE UPDATE ON journey_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_edges_updated_at BEFORE UPDATE ON journey_edges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_goals_updated_at BEFORE UPDATE ON journey_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON journey_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW journey_stats AS
SELECT 
    j.id as journey_id,
    j.name as journey_name,
    COUNT(DISTINCT jn.id) as total_nodes,
    COUNT(DISTINCT je.id) as total_edges,
    COUNT(DISTINCT jg.id) as total_goals,
    COUNT(DISTINCT CASE WHEN jg.status = 'completed' THEN jg.id END) as completed_goals,
    COUNT(DISTINCT jm.id) as total_milestones,
    COUNT(DISTINCT CASE WHEN jm.status = 'completed' THEN jm.id END) as completed_milestones,
    COUNT(DISTINCT jr.id) as total_reports
FROM journeys j
LEFT JOIN journey_nodes jn ON j.id = jn.journey_id
LEFT JOIN journey_edges je ON j.id = je.journey_id
LEFT JOIN journey_goals jg ON j.id = jg.journey_id
LEFT JOIN journey_milestones jm ON j.id = jm.journey_id
LEFT JOIN journey_reports jr ON j.id = jr.journey_id
WHERE j.is_deleted = FALSE
GROUP BY j.id, j.name;




ALTER TABLE journey_milestones ADD COLUMN sort_order INTEGER DEFAULT 0;
CREATE INDEX idx_journey_milestones_sort ON journey_milestones(journey_id, sort_order);