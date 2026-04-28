-- DropForeignKey
ALTER TABLE "GoalEvent" DROP CONSTRAINT "GoalEvent_playerId_fkey";

-- DropForeignKey
ALTER TABLE "GoalEvent" DROP CONSTRAINT "GoalEvent_teamId_fkey";

-- AlterTable
ALTER TABLE "GoalEvent" ADD COLUMN     "manualPlayerName" TEXT,
ADD COLUMN     "manualTeamName" TEXT,
ALTER COLUMN "playerId" DROP NOT NULL,
ALTER COLUMN "teamId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GoalEvent" ADD CONSTRAINT "GoalEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalEvent" ADD CONSTRAINT "GoalEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
