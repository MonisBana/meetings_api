# Meetings API

A node-express meetings API using mongo as a backend.

## Routes

**1. Create Meeting**
```json
url: http://18.219.77.183:5000/api/meetings/
type: POST
request: {
    "title":"meeting1",
    "start_time":"2020-09-14 00:00:00",
    "end_time":"2020-09-15 02:00:00"
}
```
**2. Add Participant**
```json
url: http://18.219.77.183:5000/api/participants/
type: POST
request: {
     "name":"Rohit",
     "email":"abc@gmail.com.com"
}
```
**3. Add Participant to a meeting**
```json
url: http://18.219.77.183:5000/api/meetings/addParticipant?meetingId=<meetingId>&participantId=<partcipantId>
type: POST
```
**4. Get meeting by Id**
```json
url: http://18.219.77.183:5000/api/meetings?meetingId=<meetingId>
type: GET
```
**5. Get meeting by Time frame(Pagination)**
```json
url: http://18.219.77.183:5000/api/meetings/getmeetingByTime/?start_time=<Start_time>&end_time=<end_time>&page=<page_number>&limit=<limit>
type: GET

example: http://18.219.77.183:5000/api/meetings/getmeetingByTime/?start_time=2020-09-13 00:00:00&end_time=2020-09-15 04:00:00&page=0&limit=2
```
**6. Get meetings  of a Partcipant**
```json
url: http://18.219.77.183:5000/api/participants?email=<email>
type: GET
```
