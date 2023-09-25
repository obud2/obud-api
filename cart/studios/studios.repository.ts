import { StudiosSortData, Studios, StudiosDTO, StudiosShort } from './studios.model';
import { GetListRequestDTO, ResponseDTO, ResponseSingleDTO } from '../dto/request/RequestDTO';

export default interface IStudiosRepository {
  findByIdInfo(studiosId: string): Promise<StudiosShort>;
}
