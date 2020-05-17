export interface Area {
  id: string
  name: string
  lastReset?: Date
}

export interface Repeat {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
  [key: string]: boolean
}

export interface Opportunity {
  id: string
  after: Date
  duration: number
  enabled: boolean
  start: string
  end: string
  repeat: Repeat

  // Used in edit views for staged changes
  added?: boolean
  edited?: boolean
  deleted?: boolean
}

export type OpportunityInput = Opportunity & {
  added: boolean
  edited: boolean
  deleted: boolean
}

export interface OpportunityDelta {
  id?: string
  after?: Date
  duration?: number
  enabled?: boolean
  start?: string
  end?: string
  repeat?: Repeat
}

export interface ActivityDelta {
  id?: string
  description: string
  duration: number
  order?: number
  done?: boolean
  created?: Date
  modified?: Date
  completed?: Date
}

export interface Activity {
  id: string
  description: string
  duration: number
  order: number
  done: boolean
  created: Date
  modified: Date
  completed?: Date
}

// Base types
// @TODO rename to Slot? TimeSlot? TimePocket?
export type Time = {}
export type Task = {}

// Computed types (gone through the algorithm)
export type ComputedTime = {}
export type ComputedTask = {}

export interface DatabaseType {
  observeAreas(
    success: (areas: Area[]) => void,
    failure: (reason: Error) => void
  ): () => void
  addArea(name: string): Promise<Area>
  editArea(areaId: string, name: string): Promise<void>
  deleteArea(areaId: string): Promise<void>
  setOpportunities(
    areaId: string | null,
    opportunities: OpportunityInput[]
  ): Promise<void>
  getOpportunities(areaId: string): Promise<Opportunity[]>
  observeOpportunities(
    areaId: string,
    success: (opportunities: Opportunity[]) => void,
    failure: (reason: Error) => void
  ): () => void
  observeActivities(
    areaId: string,
    success: (activities: Activity[]) => void,
    failure: (reason: Error) => void
  ): () => void
  addActivity(areaId: string, activity: ActivityDelta): Promise<Activity>
  editActivity(
    areaId: string,
    activityId: string,
    activity: ActivityDelta
  ): Promise<void>
  /** toggle an activity as completed */
  completeActivity(areaId: string, activityId: string): Promise<void>
  /** untoggle an activity as completed, puts it back on the board */
  incompleteActivity(areaId: string, activityId: string): Promise<void>
  /** Fetches truly finished activities */
  getCompletedActivities(areaId: string): Promise<Activity[]>
  /** Fetches all activities that are completed and archives them so the schedule can be recreated */
  archiveCompletedActivities(areaId: string): Promise<void>
  /** Reorder all activities, and make the selected activity either top 1 or bottom -1 */
  reorderActivities(
    areaId: string,
    activityId: string,
    ordering: number
  ): Promise<void>
  /** Observes current area last reset timestamp */
  observeLastAreaReset(
    areaId: string,
    success: (lastReset: Date) => void,
    failure: (reason: Error) => void
  ): () => void
}
