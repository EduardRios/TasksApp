# TasksApp

TaskApp is a simple React Native application that allows users to manage tasks with deadlines. Users can add tasks by entering a task name and selecting a due date and time. The app displays a list of tasks with a progress bar for each, showing how much time is left until the deadline. The progress bar changes color based on the time remaining—green for more than half the time left, yellow when less than half the time is left, and red when the time is almost up or has expired. It also includes a countdown timer that updates every second, showing the days, hours, minutes, and seconds left until the task is due.

1. Clone the Repository Open your terminal and run:
git clone https://github.com/your-username/TaskApp.git
This will clone the repository to your local machine.

2. Navigate to the Project Directory Go into the folder where the project was cloned:

cd TaskApp

3. Install Dependencies Install the required npm packages for React Native:
npm install

4. Run the Project on Android or iOS
For Android, make sure you have an Android emulator running or an Android device connected via USB. Then, run:
npx react-native run-android
For iOS (only on MacOS), make sure you have Xcode installed. Then, run:
npx react-native run-ios

5. Start Metro Bundler If it doesn’t start automatically, run the following command to start the development server (Metro Bundler):

npx react-native start

Enjoy the App The app should now be running on your emulator or device! You can now add tasks, set deadlines, and see the countdown and progress bars in action.
