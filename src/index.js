import express from "express";
import {EVENTS, getOccurrence} from "./timer.js";
import morgan from "morgan";

const app = express()
const port = 3000

app.use(morgan("combined"))

for (const timer of Object.keys(EVENTS)) {
    app.get(`/api/skyblock/${timer}/estimate`, (req, res) => {
        const event = EVENTS[timer];
        const occurrence = getOccurrence(event)
        const estimate = {
            name: event.name,
            estimate: occurrence.start,
            queryTime: Date.now(),
            start: occurrence.start,
            startISO: new Date(occurrence.start).toISOString(),
            end: occurrence.end,
            endISO: new Date(occurrence.end).toISOString(),
            active: occurrence.active,
        }

        res.status(200).send(estimate)
    })
}

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})