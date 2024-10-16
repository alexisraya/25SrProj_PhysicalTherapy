import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:logger/logger.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hello World Notification',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'Hello World'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin;
  final Logger logger = Logger();

  @override
  void initState() {
    super.initState();

    // Initialize the plugin for both Android and iOS
    flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    // Android settings
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // iOS settings
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    // Combine Android and iOS settings
    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );

    // Initialize the notification plugin
    flutterLocalNotificationsPlugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) async {
        if (response.payload != null) {
          logger.d('Notification payload: ${response.payload}');
        }
        Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => NotificationDetailScreen(payload: response.payload),
        ));
      },
    );

    _checkPermissions();
  }

  // Check notification permissions
  void _checkPermissions() async {
    final bool? result = await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            IOSFlutterLocalNotificationsPlugin>()
        ?.requestPermissions(
          alert: true,
          badge: true,
          sound: true,
        );
    logger.d('Notification permissions granted: $result');
  }

  // Function to show cross-platform notifications
  void _showNotification() async {
    logger.d('Attempting to show notification...');

    // Android notification details
    const AndroidNotificationDetails androidPlatformChannelSpecifics =
        AndroidNotificationDetails(
      'test_channel_id',
      'Test Channel',
      channelDescription: 'A channel for testing notifications',
      importance: Importance.max,
      priority: Priority.high,
    );

    // iOS notification details
    const DarwinNotificationDetails iOSPlatformChannelSpecifics =
        DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    // Combine platform notification details
    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
      iOS: iOSPlatformChannelSpecifics,
    );

    // Show the notification
    await flutterLocalNotificationsPlugin.show(
      0,
      'Test Notification',
      'This is a test notification!',
      platformChannelSpecifics,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: ElevatedButton(
          onPressed: _showNotification,
          child: const Text('Send Notification'),
        ),
      ),
    );
  }
}

class NotificationDetailScreen extends StatelessWidget {
  final String? payload;

  const NotificationDetailScreen({super.key, this.payload});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Details'),
      ),
      body: Center(
        child: Text('Notification payload: $payload'),
      ),
    );
  }
}
