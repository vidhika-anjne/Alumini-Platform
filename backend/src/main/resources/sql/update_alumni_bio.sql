-- Update existing alumni with bio data
-- Run this ONLY if you already have alumni in the database

UPDATE alumni SET bio = 'Passionate software engineer specializing in machine learning and artificial intelligence. Experienced in Python, TensorFlow, and deep learning frameworks. Love building scalable AI solutions.' WHERE enrollment_number = 'AL-2019-001';

UPDATE alumni SET bio = 'Full-stack developer with expertise in React, Node.js, and cloud technologies. Currently working on microservices architecture and DevOps automation. Always eager to mentor juniors.' WHERE enrollment_number = 'AL-2020-002';

UPDATE alumni SET bio = 'Power systems engineer working on renewable energy projects. Specialized in solar panel design and smart grid technologies. Interested in sustainable energy solutions.' WHERE enrollment_number = 'AL-2020-003';

UPDATE alumni SET bio = 'Recently graduated civil engineer seeking opportunities in structural design and construction management. Strong foundation in AutoCAD and structural analysis software.' WHERE enrollment_number = 'AL-2021-004';

UPDATE alumni SET bio = 'Automotive engineer focused on vehicle dynamics and engine optimization. Working with CAD/CAM tools and thermal analysis. Passionate about electric vehicle technology.' WHERE enrollment_number = 'AL-2021-005';

UPDATE alumni SET bio = 'Freelance mobile app developer specializing in Flutter and React Native. Built over 15 successful apps for startups. Available for consulting and project collaborations.' WHERE enrollment_number = 'AL-2022-006';

UPDATE alumni SET bio = 'Embedded systems engineer with expertise in IoT devices and firmware development. Proficient in C/C++, Arduino, and Raspberry Pi. Working on smart home automation systems.' WHERE enrollment_number = 'AL-2018-007';

UPDATE alumni SET bio = 'Data analyst turned data scientist. Skilled in SQL, Python, R, and data visualization tools like Tableau and Power BI. Love uncovering insights from complex datasets.' WHERE enrollment_number = 'AL-2019-008';

UPDATE alumni SET bio = 'Mechanical design engineer with CAD expertise. Looking for opportunities in product design and manufacturing. Interested in additive manufacturing and 3D printing.' WHERE enrollment_number = 'AL-2020-009';

UPDATE alumni SET bio = 'Cybersecurity specialist focusing on ethical hacking and penetration testing. Certified in CEH and OSCP. Passionate about securing web applications and networks.' WHERE enrollment_number = 'AL-2022-010';

UPDATE alumni SET bio = 'Project manager in infrastructure development with 5+ years experience. Skilled in project planning, cost estimation, and construction supervision. PMP certified.' WHERE enrollment_number = 'AL-2018-011';

UPDATE alumni SET bio = 'Hardware entrepreneur building custom PCB designs for robotics applications. Running my own electronics consulting firm. Expert in circuit design and prototyping.' WHERE enrollment_number = 'AL-2019-012';

UPDATE alumni SET bio = 'Control systems engineer working on industrial automation. Experience with PLCs, SCADA systems, and process control. Interested in robotics and automation.' WHERE enrollment_number = 'AL-2021-013';

UPDATE alumni SET bio = 'Cloud architect specializing in AWS and Azure. Experienced in containerization with Docker and Kubernetes. Building highly available distributed systems.' WHERE enrollment_number = 'AL-2022-014';

UPDATE alumni SET bio = 'Senior mechanical engineer in aerospace industry. Working on aircraft component design and stress analysis. Deep knowledge of materials science and CFD simulations.' WHERE enrollment_number = 'AL-2017-015';

UPDATE alumni SET bio = 'Blockchain developer and cryptocurrency enthusiast. Building decentralized applications on Ethereum and Solidity. Co-founder of a Web3 startup.' WHERE enrollment_number = 'AL-2018-016';

UPDATE alumni SET bio = 'Urban planner working on smart city projects. Expertise in GIS, sustainable urban design, and traffic management systems. Focus on environmental impact assessment.' WHERE enrollment_number = 'AL-2020-017';

UPDATE alumni SET bio = 'Fresh graduate interested in VLSI design and semiconductor technology. Completed projects on microprocessor design and digital signal processing. Seeking entry-level positions.' WHERE enrollment_number = 'AL-2021-018';

UPDATE alumni SET bio = 'Electrical design engineer in power distribution sector. Working with high voltage systems and electrical safety standards. Proficient in ETAP and electrical CAD software.' WHERE enrollment_number = 'AL-2022-019';

UPDATE alumni SET bio = 'Recent graduate passionate about web development and UI/UX design. Knowledge of HTML, CSS, JavaScript, and modern frameworks. Looking for frontend developer roles.' WHERE enrollment_number = 'AL-2023-020';

-- Clear all existing embeddings
UPDATE alumni SET embedding_vector = NULL;

SELECT CONCAT('Updated ', COUNT(*), ' alumni records with bio data') as Result FROM alumni WHERE bio IS NOT NULL;
