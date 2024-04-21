import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, Max, Min } from "class-validator";

export class CompleteLessonCourseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(10)
  lessonIndex: number
}
