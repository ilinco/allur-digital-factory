from fastapi import APIRouter, status

router = APIRouter(prefix='/health')


@router.get('', status_code=status.HTTP_200_OK)
def read_health():
	return {'message': 'Server is fine!'}
