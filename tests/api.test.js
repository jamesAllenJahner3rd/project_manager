const mongoose = require("mongoose")
const request = require("supertest")
const server = require('../server.js')
require("dotenv").config()

// Connecting to the database before each test.
beforeEach(async () => {
  // await mongoose.connect(process.env.DB_STRING)
  await mongoose.connect(process.env.MY_LOCAL_DB)
})

// Closing database connection after each test.
afterEach(async () => {
  await mongoose.connection.close()
})

// get all projects list
describe("GET /project/", () => {
  it("should return all projects", async () => {
    const res = await request(server).get("/project/").send({
      // user: {
      //   // FIX: TypeError: Cannot read properties of undefined (reading 'googleId') 
      //   googleId: "67a7967a0af8336bcf421a63"
      // }
      userProfile: {
        _id: "67a7967a0af8336bcf421a63"
      }
    })
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});


// create new project 
// describe("POST /project/createProject", () => {
//   it("should create new project", async () => {
//     // FIX: you need to get the google id first
//     const res = await request(app).post("/project/createProject").send({
//       name: "what",
//       description: "idk",
//       startDate: "2025-03-09T00:00:00.000Z",
//       endDate: "2025-03-10T00:00:00.000Z",
//       // status: "In Progress",
//       adminId: "67a7967a0af8336bcf421a63"
//     })
//     // TODO: send a static google profile id
//     // and authenticate it in the test
//     expect(res.statusCode).toBe(302);
//     expect(res.body.name).toBe("what");
//   });
// });
