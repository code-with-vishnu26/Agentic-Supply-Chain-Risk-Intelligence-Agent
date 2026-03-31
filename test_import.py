try:
    import backend.main
    print('BACKEND IMPORTS OK')
except Exception as e:
    import traceback
    traceback.print_exc()
