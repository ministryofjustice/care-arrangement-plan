export type yesOrNo = 'Yes' | 'No'
export type whereMostlyLive = 'withInitial' | 'withSecondary' | 'split' | 'other'
export type dayValues = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type whichDaysField = (dayValues | 'other')[]
export type getBetweenHouseholds = 'initialCollects' | 'secondaryCollects' | 'other'
export type whereHandoverField = 'neutral' | 'initialHome' | 'secondaryHome' | 'school' | 'someoneElse'
