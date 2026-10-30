StenoTrack – Stenography Management System

1. Project Overview

StenoTrack is a responsive web application designed to help stenographers organise and manage stenography and transcription assignments.

The system allows users to record client details, set deadlines, assign priorities, estimate word counts and monitor job progress.

2. Problem Statement

Stenographers may handle several assignments with different clients and deadlines. Managing these assignments manually can make it difficult to monitor progress and meet deadlines.

StenoTrack provides a central place to record assignments and track their status.

3. Project Objectives

- Record stenography and transcription assignments.
- Store client names and job descriptions.
- Set priorities and due dates.
- Track pending, in-progress, and completed jobs.
- Display job statistics and completion rates.
- Validate information entered into the form.
- Save job records in the browser.

 4. Technologies Used

- HTML: Creates the structure of the webpages.
- CSS:Styles the website and makes it responsive.
- JavaScript:Handles validation, job management, and statistics.
-localStorage:Stores job records in the browser.

5. Project Structure

StenoTrack
- index.html
- Manage.html
- stat.html
- style.css
- script.js
- README.md

6. How to Run the Project

1. Open Visual Studio Code.
2. Open the StenoTrack project folder.
3. Make sure all six files are saved in the same folder.
4. Open `index.html` in your browser.
5. Alternatively, install the Live Server extension in VS Code.
6. Right-click `index.html` and select **Open with Live Server**.
7. Use "Manage Jobs" to add and update assignments.


 7. Main Features

- Dashboard with job statistics.
- Form for adding stenography jobs.
- Required-field and date validation.
- Job status updates.
- Filtering by job status.
- Job deletion with confirmation.
- Responsive design for different screen sizes.
- Browser-based data persistence.

8. Data Storage

The application uses browser `localStorage` to save job records. Data remains available after refreshing the page in the same browser profile.

The records are not automatically synchronised between different devices or browsers. Clearing browser site data may remove saved records.

9. Limitations and Future Improvements

The current project manages stenography assignments but does not automatically convert audio into text or operate a stenotype machine.

Future improvements could include:
- User accounts and secure login.
- Cloud database integration.
- Email or deadline reminders.
- Exporting job reports.
- Audio transcription integration.

10. Conclusion

StenoTrack demonstrates how HTML, CSS, and JavaScript can be combined to create a useful stenography management application. It helps organise assignments, monitor deadlines and track work progress.

Author
Mary Nyakara Ongaki, Email:mary.ongaki@student.moringaschool.com
