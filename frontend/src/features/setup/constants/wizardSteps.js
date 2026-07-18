export const WIZARD_STEPS = [
  {
    key: "societyProfile",
    title: "Society Profile",
    route: "/admin/setup/profile",
    api: "/api/setup/profile",
    dependency: null,
    canSkip: false
  },
  {
    key: "towers",
    title: "Towers",
    route: "/admin/setup/towers",
    api: "/api/setup/towers",
    dependency: "societyProfile",
    canSkip: false
  },
  {
    key: "flats",
    title: "Flats",
    route: "/admin/setup/flats",
    api: "/api/setup/flats",
    dependency: "towers",
    canSkip: false
  },
  {
    key: "amenities",
    title: "Amenities",
    route: "/admin/setup/amenities",
    api: "/api/setup/amenities",
    dependency: "flats",
    canSkip: false
  },
  {
    key: "staff",
    title: "Staff",
    route: "/admin/setup/staff",
    api: "/api/setup/staff",
    dependency: "amenities",
    canSkip: false
  },
  {
    key: "complete",
    title: "Complete",
    route: "/admin/setup/complete",
    api: null,
    dependency: "staff",
    canSkip: false
  }
];

export const getStepByKey = (key) => WIZARD_STEPS.find((step) => step.key === key);
export const getStepIndex = (key) => WIZARD_STEPS.findIndex((step) => step.key === key);
export const getStepByPath = (pathSuffix) => WIZARD_STEPS.find((step) => step.route.endsWith(pathSuffix));
