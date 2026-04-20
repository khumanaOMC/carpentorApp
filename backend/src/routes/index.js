const express = require("express");
const { authRouter } = require("./modules/auth.routes");
const { usersRouter } = require("./modules/users.routes");
const { carpentersRouter } = require("./modules/carpenters.routes");
const { contractorsRouter } = require("./modules/contractors.routes");
const { customersRouter } = require("./modules/customers.routes");
const { jobsRouter } = require("./modules/jobs.routes");
const { applicationsRouter } = require("./modules/applications.routes");
const { bookingsRouter } = require("./modules/bookings.routes");
const { attendanceRouter } = require("./modules/attendance.routes");
const { paymentsRouter } = require("./modules/payments.routes");
const { reviewsRouter } = require("./modules/reviews.routes");
const { chatsRouter } = require("./modules/chats.routes");
const { offersRouter } = require("./modules/offers.routes");
const { notificationsRouter } = require("./modules/notifications.routes");
const { adminRouter } = require("./modules/admin.routes");

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/carpenters", carpentersRouter);
apiRouter.use("/contractors", contractorsRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/attendance", attendanceRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/chats", chatsRouter);
apiRouter.use("/offers", offersRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/admin", adminRouter);

module.exports = { apiRouter };
