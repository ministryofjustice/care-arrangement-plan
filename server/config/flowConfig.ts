import paths from "../constants/paths";
import { FORM_STEPS } from "../constants/formSteps";

interface TaskStepDefinition {
    path: string; 
    dependsOn: string[];
}

type TaskFlowMapType = Record<string, TaskStepDefinition>;

export const TASK_FLOW_MAP : TaskFlowMapType = {
  [FORM_STEPS.START]: {
    path: paths.START,
    dependsOn: [],
  },
  [FORM_STEPS.SAFETY_CHECK]: {
    path: paths.SAFETY_CHECK,
    dependsOn: [FORM_STEPS.START],
  },
  [FORM_STEPS.NOT_SAFE]: {
    path: paths.NOT_SAFE,
    dependsOn: [FORM_STEPS.SAFETY_CHECK],
  },
  [FORM_STEPS.CHILDREN_SAFETY_CHECK]: {
    path: paths.CHILDREN_SAFETY_CHECK,
    dependsOn: [FORM_STEPS.SAFETY_CHECK],
  },
  [FORM_STEPS.CHILDREN_NOT_SAFE]: {
    path: paths.CHILDREN_SAFETY_CHECK,
    dependsOn: [FORM_STEPS.CHILDREN_SAFETY_CHECK],
  },
  step4: {
    path: paths.DO_WHATS_BEST,
    dependsOn: ['step3'],
  },
  step5: {
    path: paths.COURT_ORDER_CHECK,
    dependsOn: ['step4'],
  },
  step5A: {
    path: paths.EXISTING_COURT_ORDER,
    dependsOn: ['step5']
  },
    step6: {
    path: paths.NUMBER_OF_CHILDREN,
    dependsOn: ['step5'],
  },
    step7: {
    path: paths.ABOUT_THE_CHILDREN,
    dependsOn: ['step6'],
  },
    step8: {
    path: paths.ABOUT_THE_ADULTS,
    dependsOn: ['step7'],
  },
    step9: {
    path: paths.TASK_LIST,
    dependsOn: ['step8'],
  },
    step10_living_and_visiting: { 
    path: paths.LIVING_VISITING_MOSTLY_LIVE,
    dependsOn: ['step9'],
  },
    step10_living_and_visiting_A_1: { 
    path: paths.LIVING_VISITING_WILL_OVERNIGHTS_HAPPEN,
    dependsOn: ['step10_living_and_visiting'],
  },
    step10_living_and_visiting_A_1A: { 
    path: paths.LIVING_VISITING_WHICH_DAYS_OVERNIGHT,
    dependsOn: ['step10_living_and_visiting_A_1'],
  },
    step10_living_and_visiting_A_2: { 
    path: paths.LIVING_VISITING_WILL_DAYTIME_VISITS_HAPPEN,
    dependsOn: ['step10_living_and_visiting_A_1'],
  },
    step10_living_and_visiting_A_3: { 
    path: paths. LIVING_VISITING_WHICH_DAYS_DAYTIME_VISITS,
    dependsOn: ['step10_living_and_visiting_A_2'],
  },
    step10_living_and_visiting_B: { 
    path: paths.  LIVING_VISITING_WHICH_SCHEDULE,
    dependsOn: ['step10_living_and_visiting'],
  },
    step10_handovers_and_holidays_1: { 
    path: paths.HANDOVER_HOLIDAYS_GET_BETWEEN_HOUSEHOLDS,
    dependsOn: ['step9'],
  },
    step10_handovers_and_holidays_2: { 
    path: paths.HANDOVER_HOLIDAYS_WHERE_HANDOVER,
    dependsOn: ['step10_handovers_and_holidays_1'],
  },
    step10_handovers_and_holidays_3: { 
    path: paths.HANDOVER_HOLIDAYS_WILL_CHANGE_DURING_SCHOOL_HOLIDAYS,
    dependsOn: ['step10_handovers_and_holidays_2'],
  },
  step10_handovers_and_holidays_3A: { 
    path: paths.HANDOVER_HOLIDAYS_HOW_CHANGE_DURING_SCHOOL_HOLIDAYS,
    dependsOn: ['step10_handovers_and_holidays_3'],
  },
  step10_handovers_and_holidays_4: { 
    path: paths.HANDOVER_HOLIDAYS_ITEMS_FOR_CHANGEOVER,
    dependsOn: ['step10_handovers_and_holidays_3'],
  },
    step10_decision_making_1: { 
    path: paths.DECISION_MAKING_PLAN_LAST_MINUTE_CHANGES,
    dependsOn: ['step9'],
  },
  step10_decision_making_2: { 
    path: paths.DECISION_MAKING_PLAN_LONG_TERM_NOTICE,
    dependsOn: ['step10_decision_making_1'],
  },
  step10_decision_making_3: { 
    path: paths.DECISION_MAKING_PLAN_REVIEW,
    dependsOn: ['step10_decision_making_3'],
  },
    step11: { 
    path: paths.CHECK_YOUR_ANSWERS,
    dependsOn: ['step9'],
  },
  step12: { 
    path: paths.SHARE_PLAN,
    dependsOn: ['step11'],
  },
  step13: { 
    path: paths.CONFIRMATION,
    dependsOn: ['step12'],
  },

};