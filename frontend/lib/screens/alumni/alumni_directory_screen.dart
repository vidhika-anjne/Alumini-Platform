import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/alumni.dart';
import '../../services/alumni_service.dart';
import '../../services/auth_service.dart';
import '../../services/mentor_session_service.dart';

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
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final alumniService = AlumniService(authService);
      final alumni = await alumniService.getAllAlumni();

      setState(() {
        _alumni = alumni;
        _filteredAlumni = alumni;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load alumni: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
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
            Consumer<AuthService>(
              builder: (context, authService, child) {
                final isStudent = authService.userType == 'student';

                return Column(
                  children: [
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
                    if (isStudent) ...[
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pop();
                            _showBookSessionDialog(alumni);
                          },
                          icon: const Icon(Icons.schedule),
                          label: const Text('Book Mentorship Session'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ],
                );
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _showBookSessionDialog(Alumni alumni) {
    final topicController = TextEditingController();
    final descriptionController = TextEditingController();
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    TimeOfDay selectedTime = const TimeOfDay(hour: 10, minute: 0);
    int duration = 30;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: Text('Book Session with ${alumni.name}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: topicController,
                  decoration: const InputDecoration(
                    labelText: 'Session Topic',
                    hintText: 'e.g., Career Guidance, Technical Interview Prep',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: descriptionController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    hintText: 'Describe what you want to discuss...',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: selectedDate,
                            firstDate: DateTime.now(),
                            lastDate:
                                DateTime.now().add(const Duration(days: 30)),
                          );
                          if (date != null) {
                            setState(() => selectedDate = date);
                          }
                        },
                        icon: const Icon(Icons.calendar_today),
                        label: Text(
                            '${selectedDate.day}/${selectedDate.month}/${selectedDate.year}'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: selectedTime,
                          );
                          if (time != null) {
                            setState(() => selectedTime = time);
                          }
                        },
                        icon: const Icon(Icons.access_time),
                        label: Text(
                            '${selectedTime.hour}:${selectedTime.minute.toString().padLeft(2, '0')}'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<int>(
                  value: duration,
                  decoration: const InputDecoration(
                    labelText: 'Duration',
                    border: OutlineInputBorder(),
                  ),
                  items: const [
                    DropdownMenuItem(value: 30, child: Text('30 minutes')),
                    DropdownMenuItem(value: 60, child: Text('1 hour')),
                    DropdownMenuItem(value: 90, child: Text('1.5 hours')),
                    DropdownMenuItem(value: 120, child: Text('2 hours')),
                  ],
                  onChanged: (value) => setState(() => duration = value ?? 30),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (topicController.text.isNotEmpty) {
                  await _bookSession(
                    alumni,
                    DateTime(
                        selectedDate.year,
                        selectedDate.month,
                        selectedDate.day,
                        selectedTime.hour,
                        selectedTime.minute),
                    duration,
                    topicController.text,
                    descriptionController.text,
                  );
                  Navigator.of(context).pop();
                }
              },
              child: const Text('Book Session'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _bookSession(Alumni alumni, DateTime sessionDateTime,
      int duration, String topic, String description) async {
    try {
      final authService = Provider.of<AuthService>(context, listen: false);
      final studentEnrollment = authService.currentStudent?.enrollmentNumber;

      if (studentEnrollment == null) {
        throw Exception('Student not found');
      }

      final sessionService = MentorSessionService(authService);
      final result = await sessionService.bookSession(
        studentEnrollment: studentEnrollment,
        alumniEnrollment: alumni.enrollmentNumber,
        sessionDateTime: sessionDateTime,
        durationMinutes: duration,
        topic: topic,
        description: description,
      );

      if (result['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Session booked successfully! 🎉'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        throw Exception(result['message'] ?? 'Unknown error');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to book session: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
