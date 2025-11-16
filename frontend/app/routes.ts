import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/dashboard', "routes/dashboard.tsx"),
    route('/profile', "routes/profile.tsx"),
    route('/resume', "routes/resume.tsx"),
    route('/interview/setup', "routes/interviewSetup.tsx"),
    route('/interview/live/:id', "routes/interviewLive.tsx"),
    route('/interview/result/:id?', "routes/interviewResult.tsx"),
    route('/auth/login', "routes/login.tsx"),
    route('/auth/register', "routes/register.tsx"),
] satisfies RouteConfig;
