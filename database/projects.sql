-- ============================================================
-- PROJECTS DATABASE SCHEMA & SEED DATA
-- Portfolio — Zenith Kandel
-- ============================================================

CREATE DATABASE IF NOT EXISTS `portfolio_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `portfolio_db`;

-- Drop table if exists
DROP TABLE IF EXISTS `projects`;

-- Create projects table
CREATE TABLE `projects` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `title` VARCHAR(255) NOT NULL,
    `tag` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `year` VARCHAR(10) NOT NULL,
    `featured` TINYINT(1) NOT NULL DEFAULT 0,
    `badge` VARCHAR(100) NULL,
    `description` TEXT NOT NULL,
    `long_description` TEXT NULL,
    `chips` JSON NOT NULL,
    `illustration` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `github_url` VARCHAR(255) NULL,
    `live_url` VARCHAR(255) NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_category` (`category`),
    INDEX `idx_featured` (`featured`),
    INDEX `idx_year` (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial project archive records
INSERT INTO `projects` 
(`slug`, `title`, `tag`, `category`, `year`, `featured`, `badge`, `description`, `long_description`, `chips`, `illustration`, `image`, `github_url`, `live_url`, `sort_order`) 
VALUES
(
    'sastomahango',
    'Sastomahango',
    'Civic Tech · Web',
    'Civic Tech',
    '2024',
    1,
    'Hackathon Build',
    'A crowd-sourced price index for everyday goods. Users report what they paid, the system aggregates prices by locality, and shoppers see whether they\'re about to get scammed at the bazaar. Built to fight the opacity of Kathmandu\'s informal markets.',
    'Sastomahango was built to address the lack of transparent pricing in traditional Nepali retail and vegetable markets (Bazaars). By allowing shoppers across various municipal wards to submit crowdsourced prices and receipts in real time, the platform calculates median price corridors and alerts consumers about sudden artificial inflation.',
    '["PHP", "MySQL", "Crowdsourced data", "Hackathon build", "REST API"]',
    'assets/svg/projects/sastomahango.svg',
    'assets/svg/projects/sastomahango.svg',
    'https://github.com/zenithkandel',
    '',
    1
),
(
    'lifeline',
    'Lifeline',
    'Hardware · Off-Grid',
    'Hardware & IoT',
    '2024',
    1,
    'Field Tested',
    'An off-grid, RF-based emergency signal system. When there\'s no cellular coverage — landslides, remote valleys, the post-quake window — Lifeline transmits short distress beacons across radio so a receiver in a populated area can relay them to first responders.',
    'Designed specifically for Nepal\'s challenging Himalayan topography and disaster vulnerability. Lifeline operates on unlicensed sub-GHz ISM radio bands, broadcasting ultra-low-power distress packets containing GPS coordinates and casualty status without relying on cellular towers or internet infrastructure.',
    '["RF modules", "Arduino", "Resilience tech", "Field-tested", "Sub-GHz"]',
    'assets/svg/projects/lifeline.svg',
    'assets/svg/projects/lifeline.svg',
    'https://github.com/zenithkandel',
    '',
    2
),
(
    'sawari',
    'Sawari',
    'Transit · Web App',
    'Transit',
    '2025',
    1,
    'Live Demo',
    'A complete public transport companion for Kathmandu. Enter where you are, enter where you want to go, and Sawari hands you the full walkthrough — the bus, the route, the fare, the road condition, the ETA. Built around the city\'s actual, chaotic network.',
    'Kathmandu\'s public transit network lacks official schedules and centralized route maps. Sawari models microbus routes, Sajha Yatayat lines, and tempo corridors with localized graph algorithms to provide multi-modal route guidance, accurate fare estimates, and transfer hints.',
    '["JavaScript", "Routing logic", "Kathmandu transit", "Live demo", "Leaflet Maps"]',
    'assets/svg/projects/sawari.svg',
    'assets/svg/projects/sawari.svg',
    'https://github.com/zenithkandel',
    'https://zenithkandel.com.np',
    3
),
(
    'agropan',
    'AgroPan',
    'IoT · Agriculture',
    'Hardware & IoT',
    '2024',
    1,
    'Field Prototype',
    'A soil monitoring and crop recommendation rig. Sensor arrays measure moisture, pH, and nutrients in the field; AgroPan returns a crop recommendation tailored to what\'s actually in the ground — not what the seed shop is selling.',
    'AgroPan combines multi-parameter NPK soil sensor probes with ESP microcontroller nodes to measure real-time soil chemistry. Data is transmitted to a local dashboard that matches environmental parameters against regional agronomic datasets for optimal seasonal crop selection.',
    '["ESP series", "Sensors", "Precision agriculture", "Field prototype", "IoT"]',
    'assets/svg/projects/agropan.svg',
    'assets/svg/projects/agropan.svg',
    'https://github.com/zenithkandel',
    '',
    4
),
(
    'edutrackpro',
    'Edu Track Pro',
    'RFID · EdTech',
    'EdTech',
    '2025',
    1,
    'School Pilot',
    'A smart attendance system for Nepali schools. Every student taps their ID card on an RFID reader at the gate, attendance is logged instantly, and class teachers see who\'s actually in the room. Built to replace the paper register that\'s still standard here.',
    'Paper roll-calls consume significant classroom teaching time in government and private secondary schools. EduTrack Pro deploys high-frequency RFID scanners with local edge caching to log 1,000+ student arrivals per hour, automatically generating SMS notices to parents and daily analytics for headmasters.',
    '["RFID", "PHP", "MySQL", "EdTech", "School pilot"]',
    'assets/svg/projects/edutrackpro.svg',
    'assets/svg/projects/edutrackpro.svg',
    'https://github.com/zenithkandel',
    '',
    5
),
(
    'kantipur-disclosure',
    'Kantipur TV Security Research',
    'Security · Disclosure',
    'Security Research',
    '2024',
    0,
    'Resolved Upstream',
    'Responsible vulnerability disclosure of a critical authentication boundary bypass on the web platform of one of Nepal\'s largest national television broadcasters.',
    'Identified an access control flaw allowing unauthorized administrative access. Coordinated responsibly with the technical infrastructure team at Kantipur Television to verify the root cause and validate the patch before publication.',
    '["Vulnerability Research", "Responsible Disclosure", "Web Security", "Auth Bypass"]',
    'assets/svg/emblems/research.svg',
    'assets/svg/emblems/research.svg',
    '',
    '',
    6
),
(
    'monkeytype-bugfix',
    'Monkeytype Logic Patch',
    'Security · Open Source',
    'Security Research',
    '2025',
    0,
    'Patched Upstream',
    'Identified and reported a client-side execution anomaly in the globally popular open-source typing speed platform used by tens of thousands of typists.',
    'Discovered an edge-case logic flaw during typing session telemetry processing. Submitted detailed steps to reproduce to the open-source repository maintainers, which was confirmed and merged into the main release.',
    '["Open Source", "Client-side Logic", "Bug Disclosure", "Community Patch"]',
    'assets/svg/emblems/research.svg',
    'assets/svg/emblems/research.svg',
    'https://github.com/zenithkandel',
    '',
    7
),
(
    'offline-mesh-node',
    'MeshPacket Radio Node',
    'Hardware · Networking',
    'Hardware & IoT',
    '2023',
    0,
    'Hardware Build',
    'A portable packet radio communicator for localized peer-to-peer text exchange during power blackouts and network outages.',
    'Built with custom 3D-printed enclosure, 18650 lithium power management, OLED display, and keyboard module. Communicates over 433MHz / 915MHz LoRa mesh with end-to-end symmetric encryption.',
    '["LoRa", "Arduino", "C++", "Mesh Network", "Hardware"]',
    'assets/svg/emblems/stack.svg',
    'assets/svg/emblems/stack.svg',
    'https://github.com/zenithkandel',
    '',
    8
),
(
    'nepali-civic-scanner',
    'Civic Portal Header Audit',
    'Security · Tools',
    'Security Research',
    '2025',
    0,
    'CLI Tool',
    'An automated reconnaissance script evaluating HTTP security headers, SSL cipher configurations, and exposed endpoints on public municipal websites.',
    'A command-line tool written in Python & Bash that audits security headers (CSP, HSTS, X-Frame-Options, CORS) across government web assets to identify misconfigurations and produce remediation checklists.',
    '["Python", "Security Audit", "Recon", "CLI Tool", "Bash"]',
    'assets/svg/emblems/stack.svg',
    'assets/svg/emblems/stack.svg',
    'https://github.com/zenithkandel',
    '',
    9
);
