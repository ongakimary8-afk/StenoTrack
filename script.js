
"use strict";

/* The key used to store StenoTrack jobs in browser localStorage. */
const STORAGE_KEY = "stenotrack_jobs_v1";

/* Retrieve saved jobs. Return an empty array if no jobs exist. */
function getJobs() {
    try {
        const savedJobs = localStorage.getItem(STORAGE_KEY);
        return savedJobs ? JSON.parse(savedJobs) : [];
    } catch (error) {
        // Report storage or JSON errors in the developer console.
        console.error("Could not read saved jobs:", error);
        return [];
    }
}

/* Convert the job array into JSON and save it in the browser. */
function saveJobs(jobs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

/* Create an HTML element and optionally add a CSS class and text.
   textContent prevents user-entered text from being treated as HTML. */
function makeElement(tagName, className, text) {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text !== undefined && text !== null) {
        element.textContent = text;
    }

    return element;
}

/* Convert a date into a readable format for the job cards. */
function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    // Add a time so the date is interpreted consistently as a local date.
    const date = new Date(`${dateString}T00:00:00`);

    // If the date is invalid, display the original value instead.
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/* Count jobs in each status and calculate the completion percentage. */
function calculateStats(jobs) {
    const completed = jobs.filter(
        job => job.status === "Completed"
    ).length;

    const pending = jobs.filter(
        job => job.status === "Pending"
    ).length;

    const inProgress = jobs.filter(
        job => job.status === "In Progress"
    ).length;

    // Avoid dividing by zero when the job list is empty.
    const rate = jobs.length
        ? Math.round((completed / jobs.length) * 100)
        : 0;

    return {
        total: jobs.length,
        pending,
        inProgress,
        completed,
        rate
    };
}

/* Update the dashboard statistics and progress bar. */
function renderDashboardStats(jobs) {
    const stats = calculateStats(jobs);

    // Find the HTML elements that display the statistics.
    const totalElement = document.getElementById("totalJobs");
    const pendingElement = document.getElementById("pendingJobs");
    const progressElement = document.getElementById("progressJobs");
    const completedElement = document.getElementById("completedJobs");
    const rateElement = document.getElementById("completionRate");
    const fillElement = document.getElementById("progressFill");
    const messageElement = document.getElementById("progressMessage");

    const progressBarElement =
        document.querySelector('[role="progressbar"]');

    // Update elements only when they exist on the current page.
    if (totalElement) totalElement.textContent = stats.total;
    if (pendingElement) pendingElement.textContent = stats.pending;
    if (progressElement) progressElement.textContent = stats.inProgress;
    if (completedElement) completedElement.textContent = stats.completed;
    if (rateElement) rateElement.textContent = `${stats.rate}%`;

    // Set the visual progress bar to the completion percentage.
    if (fillElement) {
        fillElement.style.width = `${stats.rate}%`;
    }

    // Update the progress bar's accessibility value.
    if (progressBarElement) {
        progressBarElement.setAttribute("aria-valuenow", stats.rate);
    }

    // Display a message appropriate to the current job count.
    if (messageElement) {
        if (!stats.total) {
            messageElement.textContent =
                "Add a job to start tracking your progress.";
        } else {
            messageElement.textContent =
                `${stats.completed} of ${stats.total} jobs completed.`;
        }
    }
}

/* Update the statistics displayed on the About page. */
function renderAboutStats(jobs) {
    const stats = calculateStats(jobs);

    const totalElement = document.getElementById("aboutTotal");
    const completedElement = document.getElementById("aboutCompleted");
    const rateElement = document.getElementById("aboutRate");

    if (totalElement) {
        totalElement.textContent = stats.total;
    }

    if (completedElement) {
        completedElement.textContent = stats.completed;
    }

    if (rateElement) {
        rateElement.textContent = `${stats.rate}%`;
    }
}

/* Choose the label for the next status action. */
function getNextStatusLabel(status) {
    if (status === "Pending") {
        return "Start job";
    }

    if (status === "In Progress") {
        return "Mark completed";
    }

    return "Reopen job";
}

/* Create the visual card for one stenography assignment. */
function createJobCard(job) {
    const card = makeElement("article", "job-card");
    const top = makeElement("div", "job-card-top");
    const titleBlock = makeElement("div");

    // Display the job title, client, and type.
    const title = makeElement("h3", "", job.title);
    const meta = makeElement(
        "p",
        "job-meta",
        `${job.client} · ${job.type}`
    );

    // CSS class names cannot contain spaces, so replace them with hyphens.
    const statusClass =
        `status-${job.status.replace(/\s+/g, "-")}`;

    const status = makeElement(
        "span",
        `status-badge ${statusClass}`,
        job.status
    );

    titleBlock.append(title, meta);
    top.append(titleBlock, status);
    card.append(top);

    // Show the optional job description only when one was entered.
    if (job.description) {
        card.append(
            makeElement("p", "job-description", job.description)
        );
    }

    // Display priority, deadline, and word count as tags.
    const tags = makeElement("div", "job-tags");

    tags.append(
        makeElement(
            "span",
            `tag priority-${job.priority}`,
            `${job.priority} priority`
        )
    );

    tags.append(
        makeElement("span", "tag", `Due: ${formatDate(job.dueDate)}`)
    );

    // Show the word count only when it is greater than zero.
    if (Number(job.wordCount) > 0) {
        tags.append(
            makeElement(
                "span",
                "tag",
                `${Number(job.wordCount).toLocaleString()} words`
            )
        );
    }

    card.append(tags);

    // Create the buttons for changing status and deleting a job.
    const actions = makeElement("div", "job-actions");

    const statusButton = makeElement(
        "button",
        "small-button",
        getNextStatusLabel(job.status)
    );

    statusButton.type = "button";

    // Clicking this button changes the job's status.
    statusButton.addEventListener("click", () => {
        updateJobStatus(job.id);
    });

    const deleteButton = makeElement(
        "button",
        "small-button danger",
        "Delete job"
    );

    deleteButton.type = "button";

    // Clicking this button asks whether the job should be deleted.
    deleteButton.addEventListener("click", () => {
        deleteJob(job.id);
    });

    actions.append(statusButton, deleteButton);
    card.append(actions);

    return card;
}

/* Display job cards inside the requested HTML container. */
function renderJobList(containerId, jobs) {
    const container = document.getElementById(containerId);

    // Stop if this container is not on the current page.
    if (!container) {
        return;
    }

    // Remove old cards before rendering the latest list.
    container.replaceChildren();

    // Show a message when no jobs are available to display.
    if (!jobs.length) {
        container.append(
            makeElement(
                "div",
                "empty-state",
                "No jobs to display yet. Add a stenography job to get started."
            )
        );
        return;
    }

    // Create and insert one card for each job.
    jobs.forEach(job => {
        container.append(createJobCard(job));
    });
}

/* Show up to four of the most recently added jobs on the dashboard. */
function renderDashboardJobs(jobs) {
    const newestFirst = [...jobs].sort(
        (a, b) => b.createdAt - a.createdAt
    );

    renderJobList("dashboardJobs", newestFirst.slice(0, 4));
}

/* Show the job register, applying the selected status filter. */
function renderManageJobs(jobs) {
    const filterElement = document.getElementById("jobFilter");
    const countElement = document.getElementById("jobCount");

    // The job register exists only on the Manage Jobs page.
    if (!document.getElementById("manageJobs")) {
        return;
    }

    const filter = filterElement ? filterElement.value : "All";

    // "All" displays every job; other choices match a specific status.
    const filteredJobs = filter === "All"
        ? jobs
        : jobs.filter(job => job.status === filter);

    // Update the number of jobs currently being displayed.
    if (countElement) {
        countElement.textContent = filteredJobs.length;
    }

    renderJobList("manageJobs", filteredJobs);
}

/* Refresh all page sections using the latest saved job records. */
function renderApp() {
    const jobs = getJobs();

    // Each function checks whether its elements exist on this page.
    renderDashboardStats(jobs);
    renderDashboardJobs(jobs);
    renderManageJobs(jobs);
    renderAboutStats(jobs);
}

/* Move a job through Pending, In Progress, and Completed. */
function updateJobStatus(jobId) {
    const jobs = getJobs();

    // Find the job with the matching unique ID.
    const job = jobs.find(item => item.id === jobId);

    if (!job) {
        return;
    }

    // Determine the next status in the workflow.
    if (job.status === "Pending") {
        job.status = "In Progress";
    } else if (job.status === "In Progress") {
        job.status = "Completed";
    } else {
        // Reopening a completed job sets it back to Pending.
        job.status = "Pending";
    }

    // Save the updated status and redraw the page.
    saveJobs(jobs);
    renderApp();
}

/* Delete a job only after the user confirms the action. */
function deleteJob(jobId) {
    const shouldDelete = window.confirm(
        "Are you sure you want to delete this job?"
    );

    // If the user cancels, leave the job unchanged.
    if (!shouldDelete) {
        return;
    }

    // Keep every job except the one selected for deletion.
    const remainingJobs = getJobs().filter(
        job => job.id !== jobId
    );

    saveJobs(remainingJobs);
    renderApp();
}

/* Display a validation message beneath a form field. */
function setFieldError(elementId, message) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = message;
    }
}

/* Check form values before creating a new job record. */
function validateJobForm(values) {
    let valid = true;

    // Clear previous errors so old messages do not remain visible.
    setFieldError("clientError", "");
    setFieldError("titleError", "");
    setFieldError("dateError", "");
    setFieldError("wordError", "");

    // A client name is required.
    if (!values.client.trim()) {
        setFieldError(
            "clientError",
            "Please enter the client's name."
        );
        valid = false;
    }

    // A job title is required.
    if (!values.title.trim()) {
        setFieldError(
            "titleError",
            "Please enter a job title."
        );
        valid = false;
    }

    // Prevent a due date earlier than today's date.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!values.dueDate) {
        setFieldError("dateError", "Please choose a due date.");
        valid = false;
    } else {
        const due = new Date(`${values.dueDate}T00:00:00`);

        if (Number.isNaN(due.getTime()) || due < today) {
            setFieldError(
                "dateError",
                "Due date cannot be earlier than today."
            );
            valid = false;
        }
    }

    // Word count is optional, but it cannot be negative.
    if (
        values.wordCount !== "" &&
        (
            !Number.isFinite(Number(values.wordCount)) ||
            Number(values.wordCount) < 0
        )
    ) {
        setFieldError(
            "wordError",
            "Word count must be zero or a positive number."
        );
        valid = false;
    }

    return valid;
}

/* Set up the job form if it exists on the current page. */
function setupJobForm() {
    const form = document.getElementById("jobForm");

    // Other pages do not have this form, so nothing else is needed there.
    if (!form) {
        return;
    }

    form.addEventListener("submit", event => {
        // Prevent the browser from reloading the page on submission.
        event.preventDefault();

        // Collect the values entered into the form fields.
        const values = {
            client: document.getElementById("clientName").value,
            title: document.getElementById("jobTitle").value,
            description: document.getElementById("jobDescription").value,
            type: document.getElementById("jobType").value,
            priority: document.getElementById("jobPriority").value,
            dueDate: document.getElementById("dueDate").value,
            wordCount: document.getElementById("wordCount").value
        };

        const message = document.getElementById("formMessage");

        // Stop submission if any validation check fails.
        if (!validateJobForm(values)) {
            if (message) {
                message.textContent =
                    "Please correct the errors above and try again.";
                message.className = "form-message error";
            }
            return;
        }

        // Build a new job record with a unique ID and initial status.
        const newJob = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            client: values.client.trim(),
            title: values.title.trim(),
            description: values.description.trim(),
            type: values.type,
            priority: values.priority,
            dueDate: values.dueDate,
            wordCount: values.wordCount === ""
                ? 0
                : Number(values.wordCount),
            status: "Pending",
            createdAt: Date.now()
        };

        // Add the new job to the existing records.
        const jobs = getJobs();
        jobs.push(newJob);

        // Save the updated records to browser storage.
        saveJobs(jobs);

        // Clear the form after the job has been saved successfully.
        form.reset();

        // Display a success message.
        if (message) {
            message.textContent = "Job saved successfully.";
            message.className = "form-message";
        }

        // Refresh the job list and all statistics.
        renderApp();
    });
}

/* Make the status filter refresh the job list when changed. */
function setupJobFilter() {
    const filterElement = document.getElementById("jobFilter");

    if (filterElement) {
        filterElement.addEventListener("change", renderApp);
    }
}

/* Start the application after the HTML document has loaded. */
document.addEventListener("DOMContentLoaded", () => {
    setupJobForm();
    setupJobFilter();
    renderApp();
});

/* Refresh the page if job storage changes in another browser tab. */
window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
        renderApp();
    }
});
