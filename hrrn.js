document.addEventListener('DOMContentLoaded', function () {
    // Initialize the HRRN simulation when the page loads
    simulateHRRN();
});

// Function to start HRRN simulation
function startHRRN() {
    const processes = [];
    const processCount = document.getElementById('processCount').value;

    for (let i = 1; i <= processCount; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);

        processes.push({ id: `P${i}`, arrivalTime, burstTime, remainingTime: burstTime, waitingTime: 0, turnaroundTime: 0, responseRatio: 0 });
    }

    // Call HRRN simulation logic
    simulateHRRN(processes);
}

function simulateHRRN(processes) {
    let currentTime = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let executedProcesses = [];
    let readyQueue = [];

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="pipeline-horizontal" id="top-pipeline">
            <p>Ready Queue:</p>
            <div id="readyQueue" class="ready-queue"></div>
        </div>
        <div class="space"></div>
        <div class="pipeline-horizontal" id="bottom-pipeline">
            <p>Process Execution Pipeline:</p>
            <div id="processPipeline" class="process-pipeline"></div>
        </div>
        <p>Total Execution Time: <span id="totalExecutionTime">0</span>s</p>
        <p>Average Waiting Time: <span id="averageWaitingTime">0</span>s</p>
        <p>Average Turnaround Time: <span id="averageTurnaroundTime">0</span>s</p>
    `;

    while (executedProcesses.length < processes.length) {
        const eligibleProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (eligibleProcesses.length > 0) {
            eligibleProcesses.forEach(process => {
                process.turnaroundTime = process.waitingTime + process.remainingTime;
                process.responseRatio = (process.waitingTime + process.remainingTime) / process.remainingTime;
            });

            eligibleProcesses.sort((p1, p2) => p2.responseRatio - p1.responseRatio);
            const currentProcess = eligibleProcesses[0];

            const remainingBurstTime = Math.min(currentProcess.remainingTime, 1); // Adjust this for more granular animation

            currentProcess.waitingTime = currentTime - currentProcess.arrivalTime;
            totalWaitingTime += currentProcess.waitingTime;

            readyQueue.push(currentProcess);
            updateReadyQueue(readyQueue);

            currentTime += remainingBurstTime;

            if (currentProcess.remainingTime === remainingBurstTime) {
                totalTurnaroundTime += currentProcess.turnaroundTime;
                executedProcesses.push(currentProcess);

                setTimeout(() => {
                    updateProcessPipeline(currentProcess);
                    readyQueue = readyQueue.filter(p => p !== currentProcess);
                    updateReadyQueue(readyQueue);
                }, (currentTime - remainingBurstTime) * 500); // Adjust this for more granular animation
            } else {
                setTimeout(() => {
                    readyQueue.push(currentProcess); // Re-add to the ready queue for the next iteration
                    updateReadyQueue(readyQueue);
                }, currentTime * 500); // Adjust this for more granular animation
            }

            currentProcess.remainingTime -= remainingBurstTime;
        } else {
            currentTime++;
        }
    }

    const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    const totalExecutionTime = currentTime.toFixed(2);

    document.getElementById('totalExecutionTime').textContent = totalExecutionTime;
    document.getElementById('averageWaitingTime').textContent = averageWaitingTime;
    document.getElementById('averageTurnaroundTime').textContent = calculateAverageTurnaroundTime(executedProcesses);
}

function calculateAverageTurnaroundTime(processes) {
    const totalTurnaroundTime = processes.reduce((sum, process) => sum + process.turnaroundTime, 0);
    return (totalTurnaroundTime / processes.length).toFixed(2);
}

function updateReadyQueue(queue) {
    const readyQueueDiv = document.getElementById('readyQueue');
    readyQueueDiv.innerHTML = queue.map(process => `
        <div class="process-horizontal" style="animation-duration:${1}s;">
            ${process.id} (Remaining: ${process.remainingTime}s)
        </div>
    `).join('');
}

function updateProcessPipeline(process) {
    const processPipelineDiv = document.getElementById('processPipeline');
    processPipelineDiv.innerHTML += `
        <div class="process" style="animation-duration:${process.remainingTime}s; animation-delay:${process.waitingTime}s">
            ${process.id} (Wait: ${process.waitingTime}s)
        </div>
    `;
}
