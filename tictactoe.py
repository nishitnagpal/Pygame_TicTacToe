import pygame
import random

pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 800, 600
WIN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("TIC - TAC - TOE")

# Grid dimensions
ROWS, COLS = 3, 3
SQUARE_SIZE = 100

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
LIGHT_BLUE = (173, 216, 230)

FONT = pygame.font.SysFont(None, 48)
TEXT_FONT = pygame.font.SysFont("comicsans", 20)

# Initialize 2D array
squares = [['' for _ in range(COLS)] for _ in range(ROWS)]
current_player = "X"
game_started = False
game_result = False
option1 = False
option2 = False
is_player_turn = random.choice([True, False])
computer_move_delay = 1000  # milliseconds
computer_move_time = 0
pending_computer_move = False

def draw_grid(WIN, squares):
    global game_started, game_result

    WIN.fill(BLACK)

    total_grid_width = COLS * SQUARE_SIZE
    total_grid_height = ROWS * SQUARE_SIZE
    start_x = (WIDTH - total_grid_width) / 2
    start_y = (HEIGHT - total_grid_height) / 2

    rect1 = None
    rect2 = None

    if game_started:
        for row in range(ROWS):
            for col in range(COLS):
                rect = pygame.Rect(start_x + col * SQUARE_SIZE, start_y + row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE)
                pygame.draw.rect(WIN, WHITE, rect, 1)

                if squares[row][col] != '':
                    text = FONT.render(squares[row][col], True, GREEN if squares[row][col] == 'X' else BLUE)
                    WIN.blit(text, (start_x + col * SQUARE_SIZE + SQUARE_SIZE // 3, start_y + row * SQUARE_SIZE + SQUARE_SIZE // 3))

    if not game_started and not game_result:
        rect1 = pygame.Rect(WIDTH / 5, HEIGHT / 3, 200, 100)
        pygame.draw.rect(WIN, BLUE, rect1)
        pygame.draw.rect(WIN, LIGHT_BLUE, rect1, 2)

        text1 = TEXT_FONT.render("Play with computer", True, WHITE)
        text1_rect = text1.get_rect(center=rect1.center)
        WIN.blit(text1, text1_rect)

        rect2 = pygame.Rect(WIDTH / 2, HEIGHT / 3, 200, 100)
        pygame.draw.rect(WIN, BLUE, rect2)
        pygame.draw.rect(WIN, LIGHT_BLUE, rect2, 2)

        text2 = TEXT_FONT.render("2 Players Game", True, WHITE)
        text2_rect = text2.get_rect(center=rect2.center)
        WIN.blit(text2, text2_rect)

        text_intro = TEXT_FONT.render("Please select an option to play", True, WHITE)
        text_intro_rect = text_intro.get_rect(center=(WIDTH / 2, HEIGHT / 6))
        WIN.blit(text_intro, text_intro_rect)

    # Display text based on game mode
    text = TEXT_FONT.render("", True, WHITE)

    if option1 and not game_result and game_started:
        if is_player_turn:
            text = TEXT_FONT.render("Player's Turn", True, WHITE)
        else:
            text = TEXT_FONT.render("Computer's Turn", True, WHITE)
    elif option2 and not game_result and game_started:
        if is_player_turn:
            text = TEXT_FONT.render("Player 1's Turn", True, WHITE)
        else:
            text = TEXT_FONT.render("Player 2's Turn", True, WHITE)

    text_rect = text.get_rect(center=(WIDTH / 2, HEIGHT / 6))
    WIN.blit(text, text_rect)

    pygame.display.update()

    return rect1, rect2


def get_grid_position(x, y):
    total_grid_width = COLS * SQUARE_SIZE
    total_grid_height = ROWS * SQUARE_SIZE
    start_x = (WIDTH - total_grid_width) / 2
    start_y = (HEIGHT - total_grid_height) / 2

    if start_x <= x <= start_x + total_grid_width and start_y <= y <= start_y + total_grid_height:
        col = int((x - start_x) // SQUARE_SIZE)
        row = int((y - start_y) // SQUARE_SIZE)
        return row, col
    return None, None


def check_winner(board):
    # Check rows, columns and diagonals for a winner
    for i in range(ROWS):
        if board[i][0] == board[i][1] == board[i][2] != '':
            return board[i][0]
        if board[0][i] == board[1][i] == board[2][i] != '':
            return board[0][i]
    if board[0][0] == board[1][1] == board[2][2] != '':
        return board[0][0]
    if board[0][2] == board[1][1] == board[2][0] != '':
        return board[0][2]
    return None


def is_board_full(board):
    for row in board:
        for cell in row:
            if cell == '':
                return False
    return True


def computer_move():
    global squares, current_player

    # Check for winning move
    for row in range(ROWS):
        for col in range(COLS):
            if squares[row][col] == '':
                squares[row][col] = current_player
                if check_winner(squares) == current_player: 
                    return
                squares[row][col] = ''

    # Block player's winning move
    opponent = 'X' if current_player == 'O' else 'O'
    for row in range(ROWS):
        for col in range(COLS):
            if squares[row][col] == '':
                squares[row][col] = opponent
                if check_winner(squares) == opponent:
                    squares[row][col] = current_player   
                    return
                squares[row][col] = ''

    # Take center if available
    if squares[1][1] == '':
        squares[1][1] = current_player
        return 

    # Take any available corner
    for row, col in [(0, 0), (0, 2), (2, 0), (2, 2)]:
        if squares[row][col] == '':
            squares[row][col] = current_player
            return

    # Take any available side
    for row, col in [(0, 1), (1, 0), (1, 2), (2, 1)]:
        if squares[row][col] == '':
           squares[row][col] = current_player
           return


def game_final(player, is_tie=False):
    global game_started, game_result

    game_result = True
    game_started = False

    WIN.fill(BLACK)
    if is_tie:
        result_text = "It's a tie!"
    else:
        result_text = f"{player} wins!"

    final_text = TEXT_FONT.render(result_text, True, GREEN)
    final_text_rect = final_text.get_rect(center=(WIDTH / 2, HEIGHT / 2))
    WIN.blit(final_text, final_text_rect)
    pygame.display.update()

    # Wait for a while to display the final result
    pygame.time.wait(2000)
    reset_game()


def reset_game():
    global game_started, game_result, squares, current_player, is_player_turn, option1, option2, last_computer_move_time

    game_started = False
    game_result = False
    option1 = False
    option2 = False
    pending_computer_move = False

    squares = [['' for _ in range(COLS)] for _ in range(ROWS)]
    current_player = "X"
    is_player_turn = random.choice([True, False])
    #last_computer_move_time = pygame.time.get_ticks()

def main():
    global current_player, game_started, game_result, option1, option2, is_player_turn, computer_move_time, pending_computer_move
    
    
    reset_game()
    run = True
    rect1, rect2 = draw_grid(WIN, squares)

    while run:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
            
            if event.type == pygame.MOUSEBUTTONDOWN:
                mouse_x, mouse_y = event.pos
                if not game_started and not game_result:
                    if rect1.collidepoint(mouse_x, mouse_y):
                        game_started = True
                        option1 = True
                        is_player_turn = random.choice([True, False])
                    elif rect2.collidepoint(mouse_x, mouse_y):
                        game_started = True
                        option2 = True
                        is_player_turn = True
                elif option2:
                    if is_player_turn:
                        row, col = get_grid_position(mouse_x, mouse_y)
                        if row is not None and col is not None and squares[row][col] == '':
                            squares[row][col] = current_player
                            if check_winner(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player)
                            elif is_board_full(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player, is_tie=True)
                            else:
                                current_player = 'O' if current_player == 'X' else 'X'
                                is_player_turn = not is_player_turn
                     
                    else:
                        row, col = get_grid_position(mouse_x, mouse_y)
                        if row is not None and col is not None and squares[row][col] == '':
                            squares[row][col] = current_player
                            if check_winner(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player)
                            elif is_board_full(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player, is_tie=True)
                            else:
                                current_player = 'X' if current_player == 'O' else 'O'
                                is_player_turn = not is_player_turn            

                elif option1:
                    if is_player_turn:
                        row, col = get_grid_position(mouse_x, mouse_y)
                        if row is not None and col is not None and squares[row][col] == '':
                            squares[row][col] = current_player
                            if check_winner(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player)
                            elif is_board_full(squares):
                                game_started = False
                                game_result = True
                                game_final(current_player, is_tie=True)
                            else:
                                current_player = 'O' if current_player == 'X' else 'X'
                                is_player_turn = not is_player_turn  
                                pending_computer_move = True
                                computer_move_time = pygame.time.get_ticks()
                                
        if option1 and pending_computer_move and not is_player_turn and not game_result:
              #pygame.time.wait(1000)
            current_time = pygame.time.get_ticks()
            if current_time - computer_move_time > computer_move_delay:
                computer_move()
                pending_computer_move = False
                if check_winner(squares):
                     game_started = False
                     game_result = True
                     game_final(current_player)
                elif is_board_full(squares):
                    game_started = False
                    game_result = True
                    game_final(current_player, is_tie=True)
                else:
                    current_player = 'X' if current_player == 'O' else 'O'
                    is_player_turn = not is_player_turn                     
        
          
        rect1, rect2 = draw_grid(WIN, squares)

    pygame.quit()

if __name__ == "__main__":
    main()


                       
                
                       
