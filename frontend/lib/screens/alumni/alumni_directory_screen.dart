import 'package:flutter/material.dart';
import '../../models/alumni.dart';

class AlumniDirectoryScreen extends StatefulWidget {
  const AlumniDirectoryScreen({super.key});

  @override
  State<AlumniDirectoryScreen> createState() => _AlumniDirectoryScreenState();
}

class _AlumniDirectoryScreenState extends State<AlumniDirectoryScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Alumni> _alumni = [];
  List<Alumni> _filteredAlumni = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAlumni();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadAlumni() async {
    // TODO: Replace with actual API call
    await Future.delayed(const Duration(seconds: 1));

    // Mock data for demonstration
    final mockAlumni = [
      Alumni(
        id: 1,
        enrollmentNumber: 'EN001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: '',
        passingYear: '2020',
        department: 'Computer Science',
        employmentStatus: 'EMPLOYED',
        experiences: [
          Experience(
            companyName: 'Tech Corp',
            position: 'Software Engineer',
            startDate: '2020-06-01',
          )
        ],
      ),
      Alumni(
        id: 2,
        enrollmentNumber: 'EN002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: '',
        passingYear: '2019',
        department: 'Design',
        employmentStatus: 'EMPLOYED',
        experiences: [
          Experience(
            companyName: 'Design Studio',
            position: 'UI/UX Designer',
            startDate: '2019-08-01',
          )
        ],
      ),
      Alumni(
        id: 3,
        enrollmentNumber: 'EN003',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password: '',
        passingYear: '2021',
        department: 'Business Administration',
        employmentStatus: 'EMPLOYED',
        experiences: [
          Experience(
            companyName: 'Business Solutions',
            position: 'Business Analyst',
            startDate: '2021-07-01',
          )
        ],
      ),
    ];

    setState(() {
      _alumni = mockAlumni;
      _filteredAlumni = mockAlumni;
      _isLoading = false;
    });
  }

  void _filterAlumni(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredAlumni = _alumni;
      } else {
        _filteredAlumni = _alumni.where((alumni) {
          final currentJob = alumni.experiences?.isNotEmpty == true
              ? alumni.experiences!.first
              : null;
          return alumni.fullName.toLowerCase().contains(query.toLowerCase()) ||
              currentJob?.companyName
                      .toLowerCase()
                      .contains(query.toLowerCase()) ==
                  true ||
              currentJob?.position
                      .toLowerCase()
                      .contains(query.toLowerCase()) ==
                  true ||
              alumni.department.toLowerCase().contains(query.toLowerCase());
        }).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Alumni Directory'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _filterAlumni,
              decoration: InputDecoration(
                hintText: 'Search alumni...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _filteredAlumni.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.people_outline,
                        size: 80,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _searchController.text.isEmpty
                            ? 'No alumni found'
                            : 'No alumni match your search',
                        style: const TextStyle(
                          fontSize: 18,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadAlumni,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filteredAlumni.length,
                    itemBuilder: (context, index) {
                      final alumni = _filteredAlumni[index];
                      final currentJob = alumni.experiences?.isNotEmpty == true
                          ? alumni.experiences!.first
                          : null;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: CircleAvatar(
                            radius: 30,
                            child: Text(
                              alumni.name.isNotEmpty
                                  ? alumni.name.substring(0, 1).toUpperCase()
                                  : 'A',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            alumni.fullName,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (currentJob != null)
                                Text(
                                  '${currentJob.position} at ${currentJob.companyName}',
                                  style: const TextStyle(
                                    color: Colors.blue,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              const SizedBox(height: 4),
                              Text(
                                  '${alumni.department} (${alumni.passingYear})'),
                              Text(
                                'Enrollment: ${alumni.enrollmentNumber}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _showAlumniDetails(context, alumni),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  void _showAlumniDetails(BuildContext context, Alumni alumni) {
    final currentJob = alumni.experiences?.isNotEmpty == true
        ? alumni.experiences!.first
        : null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            CircleAvatar(
              radius: 40,
              child: Text(
                alumni.name.isNotEmpty
                    ? alumni.name.substring(0, 1).toUpperCase()
                    : 'A',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              alumni.fullName,
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            if (currentJob != null)
              Text(
                '${currentJob.position} at ${currentJob.companyName}',
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.blue,
                  fontWeight: FontWeight.w500,
                ),
              ),
            const SizedBox(height: 24),
            _buildInfoCard('Education', [
              'Department: ${alumni.department}',
              'Passing Year: ${alumni.passingYear}',
              'Enrollment: ${alumni.enrollmentNumber}',
            ]),
            const SizedBox(height: 16),
            _buildInfoCard('Contact', [
              'Email: ${alumni.email}',
              if (alumni.employmentStatus != null)
                'Status: ${alumni.employmentStatus}',
            ]),
            if (alumni.experiences != null &&
                alumni.experiences!.isNotEmpty) ...[
              const SizedBox(height: 16),
              _buildInfoCard(
                  'Experience',
                  alumni.experiences!
                      .map((exp) =>
                          '${exp.position} at ${exp.companyName} (${exp.startDate}${exp.endDate != null ? ' - ${exp.endDate}' : ' - Present'})')
                      .toList()),
            ],
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      // TODO: Implement email functionality
                    },
                    icon: const Icon(Icons.email),
                    label: const Text('Email'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      // TODO: Implement connect functionality
                    },
                    icon: const Icon(Icons.person_add),
                    label: const Text('Connect'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(String title, List<String> items) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 8),
            ...items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Text(item),
                )),
          ],
        ),
      ),
    );
  }
}
